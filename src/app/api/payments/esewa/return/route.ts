import { NextRequest, NextResponse } from "next/server";
import { verifyEsewaPayment } from "@/lib/actions/payment-gateways";

/**
 * eSewa return URL callback.
 * eSewa redirects here with the transaction ref (rid) and our paymentId (pid).
 * We verify the payment and redirect the user to a confirmation page.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const oid = searchParams.get("oid");          // our paymentId (we set pid=paymentId at initiation)
  const refId = searchParams.get("refId");      // eSewa transaction reference
  const amtStr = searchParams.get("amt");
  const paymentId = searchParams.get("paymentId") || oid;
  const status = searchParams.get("status") || "";

  if (!paymentId) {
    return NextResponse.redirect(new URL("/booking?error=missing_params", req.url));
  }

  if (status === "failure") {
    return NextResponse.redirect(new URL(`/booking?error=canceled&paymentId=${paymentId}`, req.url));
  }

  const amount = amtStr ? parseFloat(amtStr) : 0;

  const result = await verifyEsewaPayment({
    paymentId,
    totalAmount: amount,
    transactionRef: refId || "",
  });

  if (result.success) {
    return NextResponse.redirect(new URL(`/booking?success=paid&paymentId=${paymentId}`, req.url));
  }
  return NextResponse.redirect(new URL(`/booking?error=verify_failed&paymentId=${paymentId}`, req.url));
}
