import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/auth";

const schema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.string().max(20).optional(),
  height: z.coerce.number().min(50).max(300).optional(),
  currentWeight: z.coerce.number().min(20).max(500).optional(),
  targetWeight: z.coerce.number().min(20).max(500).optional(),
  primaryGoal: z.string().min(2).max(500),
  medicalHistory: z.string().max(2000).optional(),
  allergies: z.string().max(500).optional(),
  medications: z.string().max(500).optional(),
  dietaryPreferences: z.string().max(500).optional(),
  activityLevel: z.string().max(50).optional(),
  sleepHours: z.coerce.number().min(0).max(24).optional(),
  waterIntake: z.coerce.number().min(0).max(20).optional(),
  stressLevel: z.coerce.number().min(1).max(10).optional(),
  conditions: z.string().max(500).optional(),
});

/**
 * POST /api/client/onboarding
 * Saves the initial health assessment survey data to the patient record.
 */
export async function POST(req: NextRequest) {
  const auth = await requireClient(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (data.primaryGoal) updateData.primaryGoal = data.primaryGoal;
    if (data.medicalHistory) updateData.medicalHistory = data.medicalHistory;
    if (data.allergies) updateData.allergies = data.allergies;
    if (data.medications) updateData.medications = data.medications;
    if (data.conditions) updateData.condition = data.conditions;
    if (data.currentWeight) updateData.currentWeight = data.currentWeight;
    if (data.targetWeight) updateData.targetWeight = data.targetWeight;
    if (data.height) updateData.height = data.height;
    if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
    if (data.gender) updateData.gender = data.gender;
    if (data.dietaryPreferences) updateData.dietaryPreferences = data.dietaryPreferences;
    if (data.activityLevel) updateData.activityLevel = data.activityLevel;
    updateData.onboardingCompleted = true;
    updateData.startDate = new Date();

    // Upsert the patient record
    const patient = await db.patient.upsert({
      where: { userId: auth.userId },
      update: updateData,
      create: {
        userId: auth.userId,
        ...updateData,
      },
    });

    // Create initial measurement record
    if (data.currentWeight || data.height) {
      await db.measurement.create({
        data: {
          patientId: patient.id,
          weight: data.currentWeight || null,
          height: data.height || null,
          notes: "Initial assessment (onboarding survey)",
        },
      });
    }

    // Create notification
    await db.notification.create({
      data: {
        userId: auth.userId,
        type: "ONBOARDING_COMPLETE",
        title: "Assessment complete!",
        body: "Your dietitian has been notified. Your personalized plan will be ready soon.",
        link: "/dashboard",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding survey saved successfully",
      data: patient,
    });
  } catch (error) {
    console.error("Onboarding save failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save survey" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/client/onboarding
 * Checks if the client has completed the onboarding survey.
 */
export async function GET(req: NextRequest) {
  const auth = await requireClient(req);
  if (!auth.ok) return auth.response;

  try {
    const patient = await db.patient.findUnique({
      where: { userId: auth.userId },
      select: {
        onboardingCompleted: true,
        primaryGoal: true,
        condition: true,
        currentWeight: true,
        targetWeight: true,
        height: true,
        dateOfBirth: true,
        gender: true,
        medicalHistory: true,
        allergies: true,
        medications: true,
        dietaryPreferences: true,
        activityLevel: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: patient || { onboardingCompleted: false },
    });
  } catch (error) {
    console.error("Failed to fetch onboarding status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
