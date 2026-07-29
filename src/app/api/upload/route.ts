import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { requireClientOrStaff } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/ratelimit";

/**
 * POST /api/upload
 * Handles file uploads for reports, assessment documents, and progress photos.
 *
 * Accepts multipart/form-data with a "file" field.
 * Saves to /public/uploads/ with a unique timestamped filename.
 * Returns the URL path (e.g. "/uploads/1234567890-report.pdf").
 *
 * Security:
 *   - Requires authentication (client or staff)
 *   - Rate limited (20 uploads per 10 min per IP)
 *   - File type whitelist (images, PDF, common docs)
 *   - Max file size: 10MB
 *   - Validates filename (no path traversal)
 *   - Validates magic bytes (not just extension)
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx",
]);

// Minimal magic byte signatures for common types
const MAGIC_BYTES: { ext: string; bytes: number[] }[] = [
  { ext: ".pdf", bytes: [0x25, 0x50, 0x44, 0x46] },           // %PDF
  { ext: ".png", bytes: [0x89, 0x50, 0x4e, 0x47] },           // PNG
  { ext: ".jpg", bytes: [0xff, 0xd8, 0xff] },                  // JPEG
  { ext: ".gif", bytes: [0x47, 0x49, 0x46, 0x38] },           // GIF8
  { ext: ".doc", bytes: [0xd0, 0xcf, 0x11, 0xe0] },           // DOC/XLS
  { ext: ".webp", bytes: [0x52, 0x49, 0x46, 0x46] },          // RIFF (WebP/AVI)
];

export async function POST(req: NextRequest) {
  // Rate limit: 20 uploads per 10 min
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `upload:${ip}`, limit: 20, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many uploads. Please try again later." },
      { status: 429 }
    );
  }

  // Require authentication
  const auth = await requireClientOrStaff(req);
  if (!auth.ok) return auth.response;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 10MB." },
        { status: 413 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "File is empty" },
        { status: 400 }
      );
    }

    // Validate extension
    const originalName = file.name.toLowerCase();
    const ext = path.extname(originalName);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { success: false, error: `File type "${ext}" is not allowed. Accepted: images, PDF, DOC, DOCX, XLS, XLSX` },
        { status: 415 }
      );
    }

    // Read file and validate magic bytes
    const buffer = Buffer.from(await file.arrayBuffer());
    const matchedType = MAGIC_BYTES.find(
      (t) => buffer.length >= t.bytes.length &&
            t.bytes.every((byte, i) => buffer[i] === byte)
    );

    // Allow if magic bytes match OR if it's a docx/xlsx (ZIP format: PK)
    const isZipBased = buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b;
    if (!matchedType && !isZipBased) {
      return NextResponse.json(
        { success: false, error: "File content does not match its extension" },
        { status: 415 }
      );
    }

    // Generate safe filename: timestamp + random + sanitized original name
    const sanitized = originalName
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${sanitized}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Write file
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Return the public URL
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      data: { url: fileUrl, size: file.size },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}