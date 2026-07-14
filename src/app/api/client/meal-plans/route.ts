import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/auth";

/**
 * GET /api/client/meal-plans
 * Returns the active meal plan for the logged-in client, including all meal items.
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
      return NextResponse.json({ success: true, data: null });
    }

    const mealPlan = await db.mealPlan.findFirst({
      where: {
        patientId: patient.id,
        isActive: true,
      },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
        },
        dietitian: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: mealPlan });
  } catch (error) {
    console.error("Failed to fetch meal plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch meal plan" },
      { status: 500 }
    );
  }
}
