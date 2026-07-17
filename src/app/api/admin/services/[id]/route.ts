import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";

const updateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  tagline: z.string().min(2).max(200).optional(),
  problem: z.string().max(2000).optional(),
  solution: z.string().max(2000).optional(),
  benefits: z.string().max(5000).optional(),
  duration: z.string().max(50).optional(),
  accent: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  iconName: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().optional(),
});

/**
 * PATCH /api/admin/services/[id] — update a service
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

    const before = await db.service.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    const updated = await db.service.update({ where: { id }, data: { ...parsed.data, category: parsed.data.category as any } });

    await writeAuditLog({
      userId: auth.userId,
      action: "SERVICE_UPDATED",
      entity: "Service",
      entityId: id,
      before: serializeForAudit(before),
      after: serializeForAudit(updated),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update service:", error);
    return NextResponse.json({ success: false, error: "Failed to update service" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/services/[id]
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const before = await db.service.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    await db.service.delete({ where: { id } });

    await writeAuditLog({
      userId: auth.userId,
      action: "SERVICE_DELETED",
      entity: "Service",
      entityId: id,
      before: serializeForAudit(before),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error("Failed to delete service:", error);
    return NextResponse.json({ success: false, error: "Failed to delete service" }, { status: 500 });
  }
}
