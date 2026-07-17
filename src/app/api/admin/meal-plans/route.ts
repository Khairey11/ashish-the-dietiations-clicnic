import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";

/**
 * GET /api/admin/meal-plans
 * Returns all meal plans (optionally filtered by patientId).
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    const where = patientId ? { patientId } : {};
    const plans = await db.mealPlan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        patient: {
          select: { id: true, user: { select: { name: true, email: true } } },
          },
        dietitian: { select: { name: true } },
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error("Failed to fetch meal plans:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch meal plans" },
      { status: 500 }
    );
  }
}

const itemSchema = z.object({
  meal: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  name: z.string().min(1).max(200),
  calories: z.coerce.number().min(0).max(5000),
  proteinG: z.coerce.number().min(0).max(500).optional(),
  carbsG: z.coerce.number().min(0).max(500).optional(),
  fatG: z.coerce.number().min(0).max(500).optional(),
  alternatives: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
  sortOrder: z.number().optional(),
});

const createSchema = z.object({
  patientId: z.string().min(1),
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  totalCalories: z.coerce.number().min(0).max(10000).optional(),
  proteinG: z.coerce.number().min(0).max(500).optional(),
  carbsG: z.coerce.number().min(0).max(500).optional(),
  fatG: z.coerce.number().min(0).max(500).optional(),
  startDate: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one meal item is required"),
});

/**
 * POST /api/admin/meal-plans
 * Creates a meal plan with meal items for a specific patient.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // Find the dietitian record for this admin user
    const dietitian = await db.dietitian.findFirst({
      where: { userId: auth.userId },
      select: { id: true },
    });

    let dietitianId: string;

    if (!dietitian) {
      // If admin is not a dietitian, use the first active dietitian
      const fallbackDietitian = await db.dietitian.findFirst({
        where: { isActive: true },
        select: { id: true },
      });
      if (!fallbackDietitian) {
        return NextResponse.json(
          { success: false, error: "No active dietitian found to assign meal plan" },
          { status: 400 }
        );
      }
      dietitianId = fallbackDietitian.id;
    } else {
      dietitianId = dietitian.id;
    }

    const data = parsed.data;
    const mealPlan = await db.mealPlan.create({
      data: {
        patientId: data.patientId,
        dietitianId,
        title: data.title,
        description: data.description || null,
        totalCalories: data.totalCalories || null,
        proteinG: data.proteinG || null,
        carbsG: data.carbsG || null,
        fatG: data.fatG || null,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        items: {
          create: data.items.map((item, i) => ({
            meal: item.meal,
            name: item.name,
            calories: item.calories,
            proteinG: item.proteinG || null,
            carbsG: item.carbsG || null,
            fatG: item.fatG || null,
            alternatives: item.alternatives || null,
            notes: item.notes || null,
            sortOrder: item.sortOrder ?? i,
          })),
        },
      },
      include: { items: true },
    });

    // Notify the client
    const patient = await db.patient.findUnique({
      where: { id: data.patientId },
      select: { userId: true },
    });
    if (patient) {
      await db.notification.create({
        data: {
          userId: patient.userId,
          type: "MEAL_PLAN_ASSIGNED",
          title: "New meal plan! 🍽️",
          body: `Your dietitian has assigned "${data.title}". Check it out in your dashboard.`,
          link: "/dashboard/meal-plan",
        },
      });
    }

    await writeAuditLog({
      userId: auth.userId,
      action: "MEAL_PLAN_CREATED",
      entity: "MealPlan",
      entityId: mealPlan.id,
      after: serializeForAudit(mealPlan),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, data: mealPlan }, { status: 201 });
  } catch (error) {
    console.error("Failed to create meal plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create meal plan" },
      { status: 500 }
    );
  }
}
