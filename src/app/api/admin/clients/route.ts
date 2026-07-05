import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const querySchema = z.object({
  search: z.string().max(100).optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /api/admin/clients
 * Returns paginated list of clients (role=CLIENT) with patient profile summary.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") || 50,
      offset: searchParams.get("offset") || 0,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const search = parsed.data.search?.trim();
    const where = search
      ? {
          role: "CLIENT" as const,
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : { role: "CLIENT" as const };

    const [clients, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: parsed.data.limit,
        skip: parsed.data.offset,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          patient: {
            select: {
              id: true,
              primaryGoal: true,
              condition: true,
              currentWeight: true,
              targetWeight: true,
              startDate: true,
            },
          },
          _count: {
            select: {
              appointments: true,
              payments: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: clients,
      total,
    });
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
