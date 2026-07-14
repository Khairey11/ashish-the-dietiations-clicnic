import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireContentEditor } from "@/lib/auth";

const querySchema = z.object({
  active: z.enum(["ALL", "ACTIVE", "INACTIVE"]).optional(),
  search: z.string().max(100).optional(),
  format: z.enum(["json", "csv"]).optional(),
});

/**
 * GET /api/admin/newsletter
 * Returns newsletter subscribers, optionally as CSV.
 */
export async function GET(req: NextRequest) {
  const auth = await requireContentEditor(req);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      active: searchParams.get("active") || undefined,
      search: searchParams.get("search") || undefined,
      format: searchParams.get("format") || undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {};
    if (parsed.data.active === "ACTIVE") where.isActive = true;
    if (parsed.data.active === "INACTIVE") where.isActive = false;
    if (parsed.data.search) {
      where.email = { contains: parsed.data.search, mode: "insensitive" };
    }

    const subscribers = await db.newsletterSubscriber.findMany({
      where,
      orderBy: { subscribedAt: "desc" },
      take: 500,
    });

    // CSV export
    if (parsed.data.format === "csv") {
      const header = "email,name,source,isActive,subscribedAt,unsubscribedAt\n";
      const rows = subscribers
        .map((s) =>
          [
            `"${s.email}"`,
            `"${s.name || ""}"`,
            `"${s.source}"`,
            s.isActive ? "true" : "false",
            s.subscribedAt.toISOString(),
            s.unsubscribedAt ? s.unsubscribedAt.toISOString() : "",
          ].join(",")
        )
        .join("\n");
      const csv = header + rows;
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: subscribers,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("Failed to fetch newsletter subscribers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
