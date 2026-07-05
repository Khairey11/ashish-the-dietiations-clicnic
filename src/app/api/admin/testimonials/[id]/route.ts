import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  action: z.enum(["approve", "unapprove", "feature", "unfeature", "delete"]),
});

/**
 * PATCH /api/admin/testimonials/[id]
 * Approve / unapprove / feature / unfeature a testimonial.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Testimonial ID required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    let data: Record<string, unknown> = {};
    switch (parsed.data.action) {
      case "approve":
        data = { isApproved: true };
        break;
      case "unapprove":
        data = { isApproved: false };
        break;
      case "feature":
        data = { isFeatured: true };
        break;
      case "unfeature":
        data = { isFeatured: false };
        break;
      case "delete":
        await db.testimonial.delete({ where: { id } });
        return NextResponse.json({ success: true, deleted: true });
    }

    const updated = await db.testimonial.update({
      where: { id },
      data,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update testimonial:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}
