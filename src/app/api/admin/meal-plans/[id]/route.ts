import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";

/**
 * DELETE /api/admin/meal-plans/[id]
 * Deletes a meal plan and all its items.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const before = await db.mealPlan.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!before) {
      return NextResponse.json(
        { success: false, error: "Meal plan not found" },
        { status: 404 }
      );
    }

    await db.mealPlan.delete({ where: { id } });

    await writeAuditLog({
      userId: auth.userId,
      action: "MEAL_PLAN_DELETED",
      entity: "MealPlan",
      entityId: id,
      before: serializeForAudit(before),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error("Failed to delete meal plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete meal plan" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/meal-plans/[id]
 * Toggles isActive status.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

    const before = await db.mealPlan.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json(
        { success: false, error: "Meal plan not found" },
        { status: 404 }
      );
    }

    const updated = await db.mealPlan.update({
      where: { id },
      data: { isActive: isActive !== undefined ? isActive : !before.isActive },
    });

    await writeAuditLog({
      userId: auth.userId,
      action: "MEAL_PLAN_UPDATED",
      entity: "MealPlan",
      entityId: id,
      before: serializeForAudit(before),
      after: serializeForAudit(updated),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update meal plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update meal plan" },
      { status: 500 }
    );
  }
}
