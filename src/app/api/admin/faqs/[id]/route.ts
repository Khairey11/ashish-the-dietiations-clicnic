import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";

const updateSchema = z.object({
  question: z.string().min(3).max(500).optional(),
  answer: z.string().min(3).max(5000).optional(),
  category: z.string().max(100).optional(),
  sortOrder: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
});

/**
 * PATCH /api/admin/faqs/[id]
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }

    const before = await db.fAQ.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ success: false, error: "FAQ not found" }, { status: 404 });
    }

    const updated = await db.fAQ.update({ where: { id }, data: parsed.data });

    await writeAuditLog({
      userId: auth.userId,
      action: "FAQ_UPDATED",
      entity: "FAQ",
      entityId: id,
      before: serializeForAudit(before),
      after: serializeForAudit(updated),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update FAQ:", error);
    return NextResponse.json({ success: false, error: "Failed to update FAQ" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/faqs/[id]
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const before = await db.fAQ.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ success: false, error: "FAQ not found" }, { status: 404 });
    }

    await db.fAQ.delete({ where: { id } });

    await writeAuditLog({
      userId: auth.userId,
      action: "FAQ_DELETED",
      entity: "FAQ",
      entityId: id,
      before: serializeForAudit(before),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error("Failed to delete FAQ:", error);
    return NextResponse.json({ success: false, error: "Failed to delete FAQ" }, { status: 500 });
  }
}
