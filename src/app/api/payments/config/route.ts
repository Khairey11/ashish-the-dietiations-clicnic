import { NextResponse } from "next/server";
import { getPaymentConfig } from "@/lib/actions/payments";

/**
 * Public endpoint that returns the payment configuration.
 * Safe to expose — API keys and secrets are NOT included, only boolean flags
 * indicating whether they're configured.
 */
export async function GET() {
  try {
    const config = await getPaymentConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("Failed to fetch payment config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load payment config" },
      { status: 500 }
    );
  }
}
