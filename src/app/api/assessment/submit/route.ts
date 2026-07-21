import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/ratelimit";

/**
 * POST /api/assessment/submit
 *
 * Receives the multi-step health assessment survey data and creates:
 *   1. A Lead record (status: NEW, source: WEBSITE) for the admin to review
 *   2. A User record (role: CLIENT, isActive: false) so the client is in the
 *      system but cannot access the portal until approved
 *   3. A Patient record with the assessment data stored in relevant fields
 *
 * The admin reviews the assessment in /admin/clients and approves the client
 * by setting isActive: true. Once approved, the client can log in and book.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `assessment:${ip}`, limit: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.age) {
      return NextResponse.json(
        { success: false, error: "Name, email, phone, and age are required." },
        { status: 400 }
      );
    }
    if (!body.goals || !Array.isArray(body.goals) || body.goals.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select at least one health goal." },
        { status: 400 }
      );
    }

    const lowerEmail = body.email.toLowerCase().trim();

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: lowerEmail },
      select: { id: true, isActive: true, role: true },
    });

    let userId: string;

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { success: false, error: "An account with this email already exists. Please log in to book a consultation." },
          { status: 409 }
        );
      }
      // User exists but is not yet approved — update their assessment data
      userId = existing.id;
    } else {
      // Create a new CLIENT user (inactive until approved)
      const user = await db.user.create({
        data: {
          email: lowerEmail,
          name: body.name,
          phone: body.phone,
          role: "CLIENT",
          isActive: false, // Pending approval
          patient: {
            create: {
              primaryGoal: body.goals.join(", "),
              condition: body.goals.join(", "),
              dateOfBirth: body.age ? new Date(new Date().getFullYear() - parseInt(body.age, 10), 0, 1) : null,
              gender: body.gender || null,
              height: body.height ? parseFloat(body.height) : null,
              startingWeight: body.weight ? parseFloat(body.weight) : null,
              currentWeight: body.weight ? parseFloat(body.weight) : null,
              bodyFatPct: body.bodyFat ? parseFloat(body.bodyFat) : null,
              medicalHistory: [
                `Conditions: ${body.conditions || "None reported"}`,
                `Medications: ${body.medications || "None reported"}`,
                `Allergies: ${body.allergies || "None reported"}`,
                `Family History: ${body.familyHistory || "None reported"}`,
                `Surgeries: ${body.surgeries || "None reported"}`,
                `Previous Treatments: ${body.previousTreatments || "None reported"}`,
                `Ongoing Concerns: ${body.ongoingConcerns || "None reported"}`,
              ].join("\n"),
              allergies: body.allergies || null,
              onboardingCompleted: false,
            },
          },
        },
        select: { id: true },
      });
      userId = user.id;
    }

    // Build the assessment summary for the Lead record
    const assessmentSummary = [
      `=== HEALTH ASSESSMENT SURVEY ===`,
      ``,
      `Personal: ${body.name}, ${body.age}y, ${body.gender || "N/A"}`,
      `Email: ${lowerEmail}`,
      `Phone: ${body.phone}`,
      ``,
      `Health Goals: ${body.goals.join(", ")}${body.otherGoal ? ` (${body.otherGoal})` : ""}`,
      ``,
      `Lifestyle:`,
      `  Occupation: ${body.occupation || "N/A"}`,
      `  Schedule: ${body.schedule || "N/A"}`,
      `  Activity: ${body.activityLevel || "N/A"}`,
      `  Exercise: ${body.exerciseRoutine || "N/A"}`,
      `  Sleep: ${body.sleepQuality || "N/A"}`,
      `  Stress: ${body.stressLevel || "N/A"}`,
      `  Smoking: ${body.smoking || "N/A"}`,
      `  Alcohol: ${body.alcohol || "N/A"}`,
      `  Water: ${body.waterIntake || "N/A"} glasses/day`,
      `  Diet: ${body.dietaryPrefs?.join(", ") || "N/A"}`,
      ``,
      `Medical:`,
      `  Conditions: ${body.conditions || "None"}`,
      `  Medications: ${body.medications || "None"}`,
      `  Allergies: ${body.allergies || "None"}`,
      `  Family History: ${body.familyHistory || "None"}`,
      `  Surgeries: ${body.surgeries || "None"}`,
      `  Previous Treatments: ${body.previousTreatments || "None"}`,
      `  Ongoing Concerns: ${body.ongoingConcerns || "None"}`,
      ``,
      `Body Composition (optional):`,
      `  Weight: ${body.weight || "N/A"} kg`,
      `  Height: ${body.height || "N/A"} cm`,
      `  BMI: ${body.bmi || "N/A"}`,
      `  Body Fat: ${body.bodyFat || "N/A"}%`,
      `  Muscle Mass: ${body.muscleMass || "N/A"} kg`,
      `  Visceral Fat: ${body.visceralFat || "N/A"}`,
      `  BMR: ${body.bmr || "N/A"} kcal`,
      `  Waist: ${body.waist || "N/A"} cm`,
      `  Hip: ${body.hip || "N/A"} cm`,
      ``,
      `Uploaded Files: ${body.fileUrls?.length || 0} file(s)`,
      body.fileUrls?.map((url: string) => `  - ${url}`).join("\n") || "",
    ].filter(Boolean).join("\n");

    // Create a Lead record for the admin to review
    const lead = await db.lead.create({
      data: {
        name: body.name,
        email: lowerEmail,
        phone: body.phone,
        message: assessmentSummary,
        service: body.goals.join(", "),
        source: "WEBSITE",
        status: "NEW",
      },
    });

    // Create notifications for the uploaded files (if any)
    if (body.fileUrls && body.fileUrls.length > 0) {
      // Store file URLs as documents on the patient record
      const patient = await db.patient.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (patient) {
        for (const url of body.fileUrls) {
          await db.document.create({
            data: {
              patientId: patient.id,
              name: url.split("/").pop() || "Uploaded document",
              fileUrl: url,
              fileType: url.endsWith(".pdf") ? "application/pdf" : "image",
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: "Assessment submitted successfully. Your dietitian will review your information.",
    });
  } catch (error) {
    console.error("Assessment submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit assessment. Please try again." },
      { status: 500 }
    );
  }
}
