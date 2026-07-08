import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { initiateKhaltiPayment, initiateEsewaPayment } from "@/lib/actions/payment-gateways";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/ratelimit";
import { requireClient } from "@/lib/auth";

/**
 * POST /api/payments/initiate
 * Body: { paymentId, method }
 *
 * Called from the booking flow after createBooking() returns a paymentId.
 * Initiates the Khalti/eSewa hosted checkout and returns the paymentUrl
 * for the client to redirect to.
 *
 * If gateway credentials aren't configured, returns fallback: "qr_whatsapp"
 * so the client UI can show the QR + WhatsApp proof flow instead.
 */
const schema = z.object({
  paymentId: z.string().min(1).max(40),
  method: z.enum(["khalti", "esewa"]),
});

export async function POST(req: NextRequest) {
  // Rate limit: 10 initiations per hour per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `initiate:${ip}`, limit: 10, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return new NextResponse(rateLimitResponse(rl.resetAt).body, {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
      },
    });
  }

  try {
    // Auth: must be logged in as client or staff
    const auth = await requireClient(req);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // Fetch the payment + associated client + program from DB
    const payment = await db.payment.findUnique({
      where: { id: parsed.data.paymentId },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        program: { select: { id: true, duration: true, tagline: true, price: true } },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }
    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: `Payment already ${payment.status}` },
        { status: 400 }
      );
    }
    if (!payment.client || !payment.program) {
      return NextResponse.json(
        { success: false, error: "Missing client or program on payment" },
        { status: 400 }
      );
    }
    // Ownership check: clients can only initiate their own payments; staff can initiate any
    if (auth.role === "CLIENT" && payment.clientId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    if (parsed.data.method === "khalti") {
      const result = await initiateKhaltiPayment({
        paymentId: payment.id,
        amount: payment.amount,
        description: payment.program.duration,
        customerName: payment.client.name || "Client",
        customerEmail: payment.client.email,
        customerPhone: payment.client.phone || "",
      });

      if (result.success && result.paymentUrl) {
        return NextResponse.json({
          success: true,
          paymentUrl: result.paymentUrl,
          method: "khalti",
        });
      }
      // Fallback to QR
      return NextResponse.json({
        success: true,
        fallback: "qr_whatsapp",
        method: "khalti",
        error: result.error,
      });
    }

    if (parsed.data.method === "esewa") {
      const result = await initiateEsewaPayment({
        paymentId: payment.id,
        amount: payment.amount,
        description: payment.program.duration,
      });

      if (result.success && result.paymentUrl) {
        return NextResponse.json({
          success: true,
          paymentUrl: result.paymentUrl,
          method: "esewa",
        });
      }
      return NextResponse.json({
        success: true,
        fallback: "qr_whatsapp",
        method: "esewa",
        error: result.error,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported method" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Payment initiation failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
