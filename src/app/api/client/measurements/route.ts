import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/auth";

const createSchema = z.object({
  weight: z.coerce.number().min(20).max(500).optional(),
  height: z.coerce.number().min(50).max(300).optional(),
  waist: z.coerce.number().min(30).max(200).optional(),
  hip: z.coerce.number().min(30).max(200).optional(),
  bodyFat: z.coerce.number().min(0).max(100).optional(),
  muscleMass: z.coerce.number().min(0).max(100).optional(),
  waterIntake: z.coerce.number().min(0).max(20).optional(),
  sleepHours: z.coerce.number().min(0).max(24).optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * GET /api/client/measurements
 * Returns all measurement records for the logged-in client, ordered by date.
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
      return NextResponse.json({ success: true, data: [] });
    }

    const measurements = await db.measurement.findMany({
      where: { patientId: patient.id },
      orderBy: { measuredAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: measurements });
  } catch (error) {
    console.error("Failed to fetch measurements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch measurements" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/client/measurements
 * Creates a new measurement record (weight, body composition, etc.)
 */
export async function POST(req: NextRequest) {
  const auth = await requireClient(req);
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

    const patient = await db.patient.findUnique({
      where: { userId: auth.userId },
      select: { id: true, currentWeight: true, targetWeight: true },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient profile not found. Please complete the onboarding survey first." },
        { status: 404 }
      );
    }

    // Create the measurement record
    const measurement = await db.measurement.create({
      data: {
        patientId: patient.id,
        weight: parsed.data.weight || null,
        height: parsed.data.height || null,
        waist: parsed.data.waist || null,
        hip: parsed.data.hip || null,
        bodyFat: parsed.data.bodyFat || null,
        muscleMass: parsed.data.muscleMass || null,
        notes: parsed.data.notes || null,
      },
    });

    // Update the patient's current weight if a new weight was recorded
    if (parsed.data.weight) {
      await db.patient.update({
        where: { id: patient.id },
        data: { currentWeight: parsed.data.weight },
      });

      // Calculate progress if target weight is set
      if (patient.targetWeight && patient.currentWeight) {
        const startWeight = patient.currentWeight;
        const currentWeight = parsed.data.weight;
        const targetWeight = patient.targetWeight;
        const totalToLose = Math.abs(startWeight - targetWeight);
        const lostSoFar = Math.abs(startWeight - currentWeight);
        const progressPercent = totalToLose > 0 ? Math.min(100, Math.round((lostSoFar / totalToLose) * 100)) : 0;

        // Create a progress notification if significant
        if (progressPercent >= 25 && progressPercent < 26) {
          await db.notification.create({
            data: {
              userId: auth.userId,
              type: "PROGRESS_MILESTONE",
              title: "25% progress! 🎉",
              body: `You've lost ${lostSoFar.toFixed(1)} kg — a quarter of the way to your goal!`,
              link: "/dashboard",
            },
          });
        } else if (progressPercent >= 50 && progressPercent < 51) {
          await db.notification.create({
            data: {
              userId: auth.userId,
              type: "PROGRESS_MILESTONE",
              title: "50% progress! 🎉",
              body: `Halfway there! ${lostSoFar.toFixed(1)} kg lost so far.`,
              link: "/dashboard",
            },
          });
        } else if (progressPercent >= 75 && progressPercent < 76) {
          await db.notification.create({
            data: {
              userId: auth.userId,
              type: "PROGRESS_MILESTONE",
              title: "75% progress! 🎉",
              body: `Almost there! ${lostSoFar.toFixed(1)} kg lost — keep going!`,
              link: "/dashboard",
            },
          });
        } else if (progressPercent >= 100) {
          await db.notification.create({
            data: {
              userId: auth.userId,
              type: "PROGRESS_MILESTONE",
              title: "Goal achieved! 🏆",
              body: `Congratulations! You've reached your target weight of ${targetWeight} kg!`,
              link: "/dashboard",
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: measurement }, { status: 201 });
  } catch (error) {
    console.error("Failed to create measurement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save measurement" },
      { status: 500 }
    );
  }
}
