import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalClients,
      totalAppointments,
      pendingLeads,
      activeDietitians,
      totalRevenue,
      publishedBlogPosts,
      approvedTestimonials,
      activePrograms,
    ] = await Promise.all([
      db.user.count({ where: { role: "CLIENT" } }),
      db.appointment.count(),
      db.lead.count({ where: { status: "NEW" } }),
      db.dietitian.count({ where: { isActive: true } }),
      db.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
      db.blogPost.count({ where: { isPublished: true } }),
      db.testimonial.count({ where: { isApproved: true } }),
      db.program.count({ where: { isActive: true } }),
    ]);

    // Today's appointments
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const todayAppointments = await db.appointment.count({
      where: {
        scheduledAt: { gte: startOfToday, lte: endOfToday },
      },
    });

    // New clients this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newClientsThisMonth = await db.user.count({
      where: {
        role: "CLIENT",
        createdAt: { gte: startOfMonth },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalClients,
        totalAppointments,
        todayAppointments,
        pendingLeads,
        activeDietitians,
        totalRevenue: totalRevenue._sum.amount || 0,
        publishedBlogPosts,
        approvedTestimonials,
        activePrograms,
        newClientsThisMonth,
      },
    });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
