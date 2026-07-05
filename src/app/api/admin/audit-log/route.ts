import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
  entity: z.string().max(50).optional(),
});

/**
 * GET /api/admin/audit-log
 * Returns paginated audit log entries with the acting user's name.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      limit: searchParams.get("limit") || 50,
      offset: searchParams.get("offset") || 0,
      entity: searchParams.get("entity") || undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const where = parsed.data.entity ? { entity: parsed.data.entity } : {};
    const [entries, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: parsed.data.limit,
        skip: parsed.data.offset,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      db.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: entries,
      total,
    });
  } catch (error) {
    console.error("Failed to fetch audit log:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit log" },
      { status: 500 }
    );
  }
}
