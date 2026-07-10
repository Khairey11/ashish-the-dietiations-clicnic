import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireClient } from "@/lib/auth";
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

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  // Auth
  const auth = await requireClient(req);
  if (!auth.ok) return auth.response;

  // Rate limit: 20 uploads per hour per IP
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
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `File type ${file.type} not allowed. Use PNG, JPEG, WebP, or PDF.` },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Max ${MAX_SIZE / 1024 / 1024} MB.` },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate a unique filename
    const ext = file.name.split(".").pop() || "bin";
    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Write the file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // Return the public URL
    const url = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
