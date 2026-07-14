import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/auth";

/**
 * GET /api/client/dashboard
 * Returns the logged-in client's profile, upcoming appointments, recent
 * notifications, and program/payment summary.
 */
export async function GET(req: NextRequest) {
  const auth = await requireClient(req);
  if (!auth.ok) return auth.response;

  try {
    const userId = auth.userId;

    const [user, patient, upcomingAppointments, recentNotifications, activePayment] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      }),
      db.patient.findUnique({
        where: { userId },
        select: {
          id: true,
          primaryGoal: true,
          condition: true,
          startDate: true,
          targetWeight: true,
          currentWeight: true,
          height: true,
          onboardingCompleted: true,
        },
      }),
      db.appointment.findMany({
        where: {
          clientId: userId,
          scheduledAt: { gte: new Date() },
          status: { in: ["CONFIRMED", "SCHEDULED", "PENDING"] },
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
        include: {
          dietitian: { select: { name: true } },
          service: { select: { title: true } },
          program: { select: { duration: true, tagline: true } },
        },
      }),
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.payment.findFirst({
        where: { clientId: userId, status: "PAID" },
        orderBy: { updatedAt: "desc" },
        select: { id: true, amount: true, method: true, updatedAt: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user,
        patient,
        upcomingAppointments,
        recentNotifications,
        activePayment,
      },
    });
  } catch (error) {
    console.error("Failed to fetch client dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
