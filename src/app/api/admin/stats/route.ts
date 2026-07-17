import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

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

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const todayAppointments = await db.appointment.count({
      where: { scheduledAt: { gte: startOfToday, lte: endOfToday } },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newClientsThisMonth = await db.user.count({
      where: { role: "CLIENT", createdAt: { gte: startOfMonth } },
    });

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const paidPayments = await db.payment.findMany({
      where: { status: "PAID", createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    });
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueByMonth: Array<{ month: string; revenue: number; target: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      d.setDate(1);
      const monthLabel = monthNames[d.getMonth()];
      const monthRevenue = paidPayments
        .filter((p) => {
          const pd = new Date(p.createdAt);
          return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
        })
        .reduce((sum, p) => sum + p.amount, 0);
      // Target = previous month revenue + 10% growth baseline (or flat if 0)
      const prevTarget = revenueByMonth.length > 0 ? revenueByMonth[revenueByMonth.length - 1].target : monthRevenue * 0.9;
      revenueByMonth.push({
        month: monthLabel,
        revenue: monthRevenue,
        target: Math.round(prevTarget * 1.1),
      });
    }

    // Program mix (count of payments grouped by programId, status PAID)
    const programPayments = await db.payment.groupBy({
      by: ["programId"],
      where: { status: "PAID", programId: { not: null } },
      _count: { _all: true },
    });
    const programColors = [
      "oklch(0.699 0.134 232.8)", "oklch(0.55 0.18 255)", "oklch(0.7 0.13 200)",
      "oklch(0.58 0.2 275)", "oklch(0.78 0.13 195)",
    ];
    const programIds = programPayments.map((p) => p.programId!).filter(Boolean);
    const programs = programIds.length > 0
      ? await db.program.findMany({ where: { id: { in: programIds } }, select: { id: true, duration: true } })
      : [];
    const programData = programPayments.map((p, i) => ({
      name: programs.find((pr) => pr.id === p.programId)?.duration || "Unknown",
      value: p._count._all,
      color: programColors[i % programColors.length],
    }));

    // Lead sources (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const leadsBySource = await db.lead.groupBy({
      by: ["source"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
    });
    const leadSourceData = leadsBySource.map((l) => ({
      source: l.source.charAt(0) + l.source.slice(1).toLowerCase(),
      count: l._count._all,
    }));

    // Recent activity (last 10 audit log entries)
    const recentActivityRaw = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true } } },
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
        // Chart data
        revenueByMonth,
        programData,
        leadSourceData,
        recentActivity: recentActivityRaw,
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
