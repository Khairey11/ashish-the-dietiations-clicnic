import { NextRequest, NextResponse } from "next/server";
import { verifyKhaltiPayment } from "@/lib/actions/payment-gateways";

/**
 * Khalti return URL callback.
 * Khalti redirects here with ?pidx=... and our paymentId (added in return_url).
 * We verify the payment and redirect the user to a confirmation page.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pidx = searchParams.get("pidx");
    const paymentId = searchParams.get("paymentId");
    const status = searchParams.get("status") || "";

    if (!pidx || !paymentId) {
      return NextResponse.redirect(new URL("/booking?error=missing_params", req.url));
    }

    if (status === "Canceled" || status === "canceled") {
      return NextResponse.redirect(new URL(`/booking?error=canceled&paymentId=${paymentId}`, req.url));
    }

    const result = await verifyKhaltiPayment(pidx, paymentId);

    if (result.success) {
      return NextResponse.redirect(new URL(`/booking?success=paid&paymentId=${paymentId}`, req.url));
    }
    return NextResponse.redirect(new URL(`/booking?error=verify_failed&paymentId=${paymentId}`, req.url));
  } catch (error) {
    console.error("Khalti return error:", error);
    return NextResponse.redirect(new URL("/booking?error=verify_failed", req.url));
  }
}
