import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";

/**
 * GET /api/client/export-data
 *
 * GDPR right to data portability — returns a JSON document containing all
 * data the clinic holds about the authenticated user.
 *
 * Includes: user account, patient profile, appointments, measurements,
 * meal plans + items, messages, notifications, payments, reports, documents,
 * progress photos, activity logs.
 *
 * Does NOT include: audit logs (those are operational, not personal data).
 */
export async function GET(req: NextRequest) {
  const auth = await requireClient(req);
  if (!auth.ok) return auth.response;

  try {
    const userId = auth.userId;

    // Fetch patient (the central record everything else hangs off).
    const patient = await db.patient.findUnique({
      where: { userId },
      select: {
        id: true, dateOfBirth: true, gender: true, height: true,
        startingWeight: true, currentWeight: true, targetWeight: true,
        bodyFatPct: true, medicalHistory: true, allergies: true, medications: true,
        primaryGoal: true, condition: true, startDate: true,
        emergencyName: true, emergencyPhone: true, address: true, city: true, country: true,
        dietaryPreferences: true, activityLevel: true, onboardingCompleted: true,
      },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Run all the per-entity fetches in parallel.
    const [
      user,
      appointments,
      measurements,
      mealPlans,
      messagesSent,
      messagesReceived,
      notifications,
      payments,
      reports,
      documents,
      progressPhotos,
      activityLogs,
    ] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true, email: true, name: true, phone: true, role: true,
          avatarUrl: true, emailVerified: true, createdAt: true, lastLoginAt: true,
        },
      }),
      db.appointment.findMany({
        where: { clientId: userId },
        orderBy: { scheduledAt: "desc" },
        select: {
          id: true, scheduledAt: true, durationMin: true, mode: true, status: true,
          meetingLink: true, notes: true, reason: true, isRecurring: true, createdAt: true,
          dietitian: { select: { name: true } },
          service: { select: { title: true } },
          program: { select: { duration: true } },
        },
      }),
      db.measurement.findMany({
        where: { patientId: patient.id },
        orderBy: { measuredAt: "desc" },
      }),
      db.mealPlan.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      db.message.findMany({
        where: { senderId: userId },
        orderBy: { sentAt: "desc" },
        select: {
          id: true, subject: true, body: true, sentAt: true, isRead: true,
          recipient: { select: { name: true, role: true } },
        },
      }),
      db.message.findMany({
        where: { recipientId: userId },
        orderBy: { sentAt: "desc" },
        select: {
          id: true, subject: true, body: true, sentAt: true, isRead: true,
          sender: { select: { name: true, role: true } },
        },
      }),
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, type: true, title: true, body: true, isRead: true, createdAt: true },
      }),
      db.payment.findMany({
        where: { clientId: userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, amount: true, currency: true, method: true, status: true,
          txnId: true, txnRef: true, createdAt: true, updatedAt: true,
          program: { select: { duration: true, tagline: true } },
        },
      }),
      db.report.findMany({
        where: { patientId: patient.id },
        orderBy: { uploadedAt: "desc" },
        select: { id: true, title: true, type: true, fileUrl: true, summary: true, uploadedAt: true },
      }),
      db.document.findMany({
        where: { patientId: patient.id },
        orderBy: { uploadedAt: "desc" },
      }),
      db.progressPhoto.findMany({
        where: { patientId: patient.id },
        orderBy: { uploadedAt: "desc" },
      }),
      db.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, action: true, entity: true, entityId: true, ipAddress: true, createdAt: true },
      }),
    ]);

    // Audit the export (GDPR requires logging of access to personal data).
    await writeAuditLog({
      userId,
      action: "DATA_EXPORTED",
      entity: "User",
      entityId: userId,
      ipAddress: getClientIp(req),
    });

    const exportedAt = new Date().toISOString();
    return NextResponse.json({
      success: true,
      exportedAt,
      note: "This file contains all personal data Ashish Nutrition Clinic holds about you. Store it securely.",
      data: {
        user,
        patient,
        appointments,
        measurements,
        mealPlans,
        messages: {
          sent: messagesSent,
          received: messagesReceived,
        },
        notifications,
        payments,
        reports,
        documents,
        progressPhotos,
        activityLogs,
      },
    }, {
      headers: {
        // Suggest a filename for download.
        "Content-Disposition": `attachment; filename="my-data-${userId}.json"`,
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export data" },
      { status: 500 }
    );
  }
}
