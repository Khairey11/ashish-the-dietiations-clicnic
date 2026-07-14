import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/ratelimit";import { requireContentEditor } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";
import { deleteUploadByUrl } from "@/lib/file-cleanup";

const schema = z.object({
  action: z.enum(["approve", "unapprove", "feature", "unfeature", "delete"]),
});

const ACTION_MAP: Record<string, string> = {
  approve: "TESTIMONIAL_APPROVED",
  unapprove: "TESTIMONIAL_UNAPPROVED",
  feature: "TESTIMONIAL_FEATURED",
  unfeature: "TESTIMONIAL_UNFEATURED",
  delete: "TESTIMONIAL_DELETED",
};

/**
 * PATCH /api/admin/testimonials/[id]
 * Approve / unapprove / feature / unfeature / delete a testimonial.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireContentEditor(req);
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

    // Fetch before-state for audit + 404 check
    const before = await db.testimonial.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }

    const action = parsed.data.action;

    if (action === "delete") {
      await db.testimonial.delete({ where: { id } });
      // Best-effort cleanup of any uploaded video file.
      if (before.videoUrl) {
        await deleteUploadByUrl(before.videoUrl);
      }
      await writeAuditLog({
        userId: auth.userId,
        action: ACTION_MAP[action],
        entity: "Testimonial",
        entityId: id,
        before: serializeForAudit(before),
        ipAddress: getClientIp(req),
      });
      return NextResponse.json({ success: true, deleted: true });
    }

    let data: Record<string, unknown> = {};
    switch (action) {
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
    }

    const updated = await db.testimonial.update({
      where: { id },
      data,
    });

    await writeAuditLog({
      userId: auth.userId,
      action: ACTION_MAP[action],
      entity: "Testimonial",
      entityId: id,
      before: serializeForAudit(before),
      after: serializeForAudit(updated),
      ipAddress: getClientIp(req),
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
