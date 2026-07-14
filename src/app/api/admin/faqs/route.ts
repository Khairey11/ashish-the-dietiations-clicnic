import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";

/**
 * GET /api/admin/faqs — list all FAQs
 */
export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const faqs = await db.fAQ.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    console.error("Failed to fetch FAQs:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

const createSchema = z.object({
  question: z.string().min(3).max(500),
  answer: z.string().min(3).max(5000),
  category: z.string().max(100).default("General"),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

/**
 * POST /api/admin/faqs — create an FAQ
 */
export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }

    const faq = await db.fAQ.create({ data: parsed.data });

    await writeAuditLog({
      userId: auth.userId,
      action: "FAQ_CREATED",
      entity: "FAQ",
      entityId: faq.id,
      after: serializeForAudit(faq),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, data: faq }, { status: 201 });
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return NextResponse.json({ success: false, error: "Failed to create FAQ" }, { status: 500 });
  }
}
