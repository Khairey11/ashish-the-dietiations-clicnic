import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";

const updateSchema = z.object({
  duration: z.string().min(1).max(50).optional(),
  days: z.coerce.number().min(1).max(365).optional(),
  price: z.coerce.number().min(0).optional(),
  originalPrice: z.coerce.number().min(0).optional(),
  tagline: z.string().min(2).max(200).optional(),
  features: z.string().max(5000).optional(),
  support: z.string().max(5000).optional(),
  accent: z.string().max(100).optional(),
  isPopular: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().optional(),
});

/**
 * PATCH /api/admin/programs/[id] — update a program
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

    const before = await db.program.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ success: false, error: "Program not found" }, { status: 404 });
    }

    const updated = await db.program.update({ where: { id }, data: parsed.data });

    await writeAuditLog({
      userId: auth.userId,
      action: "PROGRAM_UPDATED",
      entity: "Program",
      entityId: id,
      before: serializeForAudit(before),
      after: serializeForAudit(updated),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update program:", error);
    return NextResponse.json({ success: false, error: "Failed to update program" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/programs/[id] — delete a program
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const before = await db.program.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ success: false, error: "Program not found" }, { status: 404 });
    }

    await db.program.delete({ where: { id } });

    await writeAuditLog({
      userId: auth.userId,
      action: "PROGRAM_DELETED",
      entity: "Program",
      entityId: id,
      before: serializeForAudit(before),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error("Failed to delete program:", error);
    return NextResponse.json({ success: false, error: "Failed to delete program" }, { status: 500 });
  }
}
