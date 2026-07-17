import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  specialty: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  experience: z.coerce.number().min(0).max(50).optional(),
  isActive: z.boolean().optional(),
  availability: z.string().max(100).optional(),
});

/**
 * PATCH /api/admin/dietitians/[id]
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

    const before = await db.dietitian.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ success: false, error: "Dietitian not found" }, { status: 404 });
    }

    const updated = await db.dietitian.update({ where: { id }, data: parsed.data });

    // Also update the user's name if changed
    if (parsed.data.name && before.name !== parsed.data.name) {
      await db.user.update({
        where: { id: before.userId },
        data: { name: parsed.data.name },
      });
    }

    await writeAuditLog({
      userId: auth.userId,
      action: "DIETITIAN_UPDATED",
      entity: "Dietitian",
      entityId: id,
      before: serializeForAudit(before),
      after: serializeForAudit(updated),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update dietitian:", error);
    return NextResponse.json({ success: false, error: "Failed to update dietitian" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/dietitians/[id] — deactivate (soft delete)
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const before = await db.dietitian.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ success: false, error: "Dietitian not found" }, { status: 404 });
    }

    // Soft delete — deactivate both dietitian and user
    await db.dietitian.update({ where: { id }, data: { isActive: false } });
    await db.user.update({ where: { id: before.userId }, data: { isActive: false } });

    await writeAuditLog({
      userId: auth.userId,
      action: "DIETITIAN_DEACTIVATED",
      entity: "Dietitian",
      entityId: id,
      before: serializeForAudit(before),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, deactivated: true });
  } catch (error) {
    console.error("Failed to deactivate dietitian:", error);
    return NextResponse.json({ success: false, error: "Failed to deactivate dietitian" }, { status: 500 });
  }
}
