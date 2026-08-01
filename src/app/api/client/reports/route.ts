import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/ratelimit";

/**
 * GET /api/client/reports
 * Returns all reports for the authenticated client's patient profile.
 */
export async function GET(req: NextRequest) {
  const auth = await requireClient(req);
  if (!auth.ok) return auth.response;

  try {
    const patient = await db.patient.findUnique({
      where: { userId: auth.userId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient profile not found" },
        { status: 404 }
      );
    }

    const reports = await db.report.findMany({
      where: { patientId: patient.id },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        fileUrl: true,
        summary: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(["LAB", "BODY_COMP", "PROGRESS", "CUSTOM"]).default("LAB"),
  // SECURITY: fileUrl must be a local upload path — never an external URL or
  // arbitrary path that could enable SSRF or path traversal attacks.
  fileUrl: z.string().min(1).max(500).refine(
    (url) => url.startsWith("/uploads/") && !url.includes(".."),
    "fileUrl must be a valid /uploads/ path"
  ),
  summary: z.string().max(2000).optional(),
});

/**
 * POST /api/client/reports
 * Creates a Report record after a file has been uploaded via /api/upload.
 * Body: { title, type?, fileUrl, summary? }
 */
export async function POST(req: NextRequest) {
  const auth = await requireClient(req);
  if (!auth.ok) return auth.response;

  // Rate limit: 30 report uploads per 15 min per user+IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `report:${auth.userId}:${ip}`, limit: 30, windowMs: 15 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const patient = await db.patient.findUnique({
      where: { userId: auth.userId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const report = await db.report.create({
      data: {
        patientId: patient.id,
        title: parsed.data.title,
        type: parsed.data.type,
        fileUrl: parsed.data.fileUrl,
        summary: parsed.data.summary || null,
      },
      select: {
        id: true,
        title: true,
        type: true,
        fileUrl: true,
        summary: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error("Failed to create report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create report" },
      { status: 500 }
    );
  }
}
