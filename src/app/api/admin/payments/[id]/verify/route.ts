import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { markPaymentPaid } from "@/lib/actions/payment-gateways";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  txnRef: z.string().max(120).optional(),
});

function getClientIpSafe(req: NextRequest): string | undefined {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    undefined
  );
}

/**
 * POST /api/admin/payments/[id]/verify
 * Marks a PENDING payment as PAID (admin manual verification after WhatsApp screenshot).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Payment ID required" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await markPaymentPaid(id, parsed.data.txnRef);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    await writeAuditLog({
      userId: auth.userId,
      action: "PAYMENT_VERIFIED",
      entity: "Payment",
      entityId: id,
      after: { status: "PAID", txnRef: parsed.data.txnRef },
      ipAddress: getClientIpSafe(req),
    });

    return NextResponse.json({ success: true, data: result.payment });
  } catch (error) {
    console.error("Failed to verify payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
