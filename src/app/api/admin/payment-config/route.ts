import { NextRequest, NextResponse } from "next/server";
import { updatePaymentConfig } from "@/lib/actions/payments";

/**
 * PUT /api/admin/payment-config
 * Updates payment configuration (QR URLs, merchant mobile, eSewa ID, bank details,
 * proof mode, instructions).
 *
 * NOTE: In production, this endpoint must be protected by an admin auth check.
 * For now, it's open to demonstrate the flow.
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await updatePaymentConfig(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update payment config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payment config" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/payment-config
 * Returns the full payment config (same as the public endpoint, kept here for
 * admin convenience).
 */
export async function GET() {
  try {
    const { getPaymentConfig } = await import("@/lib/actions/payments");
    const config = await getPaymentConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment config" },
      { status: 500 }
    );
  }
}
