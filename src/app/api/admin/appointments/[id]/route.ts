import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/ratelimit";import { requireAdmin } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";

const schema = z.object({
  status: z.enum([
    "PENDING", "CONFIRMED", "SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW", "RESCHEDULED",
  ]),
});

/**
 * PATCH /api/admin/appointments/[id]
 * Updates the status of an appointment.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Appointment ID required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // Fetch before-state for audit + 404 check
    const before = await db.appointment.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    await writeAuditLog({
      userId: auth.userId,
      action: "APPOINTMENT_UPDATED",
      entity: "Appointment",
      entityId: id,
      before: serializeForAudit(before),
      after: serializeForAudit(appointment),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, data: appointment });
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
