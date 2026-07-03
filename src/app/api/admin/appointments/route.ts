import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const querySchema = z.object({
  status: z
    .enum(["ALL", "PENDING", "CONFIRMED", "SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW", "RESCHEDULED"])
    .optional(),
  date: z.string().optional(), // YYYY-MM-DD
  dietitianId: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /api/admin/appointments
 * Returns paginated appointments with client, dietitian, service, program info.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      status: searchParams.get("status") || undefined,
      date: searchParams.get("date") || undefined,
      dietitianId: searchParams.get("dietitianId") || undefined,
      limit: searchParams.get("limit") || 50,
      offset: searchParams.get("offset") || 0,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = {};
    if (parsed.data.status && parsed.data.status !== "ALL") where.status = parsed.data.status;
    if (parsed.data.dietitianId) where.dietitianId = parsed.data.dietitianId;
    if (parsed.data.date) {
      const start = new Date(parsed.data.date + "T00:00:00");
      const end = new Date(parsed.data.date + "T23:59:59");
      where.scheduledAt = { gte: start, lte: end };
    }

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        orderBy: { scheduledAt: "desc" },
        take: parsed.data.limit,
        skip: parsed.data.offset,
        include: {
          client: { select: { id: true, name: true, email: true, phone: true } },
          dietitian: { select: { id: true, name: true } },
          service: { select: { id: true, title: true, slug: true } },
          program: { select: { id: true, duration: true, tagline: true } },
        },
      }),
      db.appointment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: appointments,
      total,
    });
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
