import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const querySchema = z.object({
  status: z.enum(["ALL", "PENDING", "APPROVED", "REJECTED"]).optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
});

/**
 * GET /api/admin/testimonials
 * Returns paginated testimonials with filter.
 * - PENDING = isApproved=false, isRejected=false (implicit — we treat unapproved+not-rejected as pending)
 * - APPROVED = isApproved=true
 * - REJECTED = we use a SiteSetting flag or simply delete. For simplicity, "rejected" = isApproved=false AND has been reviewed. We'll add a `rejectedAt` concept via metadata.
 *
 * For this implementation: PENDING = not approved, APPROVED = approved. REJECTED not supported (delete instead).
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      status: searchParams.get("status") || undefined,
      limit: searchParams.get("limit") || 50,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const where =
      parsed.data.status === "APPROVED"
        ? { isApproved: true }
        : parsed.data.status === "PENDING"
        ? { isApproved: false }
        : {};

    const testimonials = await db.testimonial.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parsed.data.limit,
    });

    return NextResponse.json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}
