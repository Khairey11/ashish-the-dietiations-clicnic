import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireClientOrStaff } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/ratelimit";

/**
 * POST /api/upload
 * Accepts a multipart/form-data file upload and saves it to /public/uploads/.
 * Returns the public URL of the uploaded file.
 *
 * Restrictions:
 * - Max 5 MB per file
 * - Allowed types: image/png, image/jpeg, image/webp, application/pdf
 * - Requires authentication (client or staff)
 */

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Map a validated MIME type to a safe file extension.
 * We NEVER trust the user-supplied extension from `file.name` — an attacker
 * can upload `evil.html` with `Content-Type: image/png` and the saved file
 * would be served as HTML → stored XSS.
 */
const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

/** Validate the file's magic bytes match its claimed MIME type. */
function validateMagicBytes(buf: Buffer, mimeType: string): boolean {
  if (mimeType === "image/png") {
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    return buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  }
  if (mimeType === "image/jpeg") {
    // JPEG: FF D8 FF
    return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  if (mimeType === "image/webp") {
    // WebP: "RIFF" .... "WEBP"
    return buf.length >= 12 && buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP";
  }
  if (mimeType === "application/pdf") {
    // PDF: "%PDF-"
    return buf.length >= 5 && buf.slice(0, 5).toString("ascii") === "%PDF-";
  }
  return false;
}

export async function POST(req: NextRequest) {
  const auth = await requireClientOrStaff(req);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(req);
  const rl = rateLimit({ key: `upload:${ip}`, limit: 20, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many uploads. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `File type ${file.type} not allowed. Use PNG, JPEG, WebP, or PDF.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Max ${MAX_SIZE / 1024 / 1024} MB.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate magic bytes to prevent MIME-type spoofing.
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { success: false, error: "File content does not match its declared type." },
        { status: 400 }
      );
    }

    // Derive the extension from the validated MIME type — never from the
    // user-supplied filename (prevents stored XSS via .html uploads).
    const ext = MIME_TO_EXT[file.type] || "bin";
    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
