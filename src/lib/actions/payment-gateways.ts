"use server";

/**
 * Production payment integration scaffolds for eSewa and Khalti.
 *
 * These server actions implement the standard Nepali payment gateway flow:
 *   1. Client initiates payment → server creates a transaction record
 *   2. Client is redirected to the gateway's hosted checkout
 *   3. Gateway redirects back to /api/payments/[provider]/return with query params
 *   4. Server verifies the response (signature / lookup) and marks the payment PAID
 *
 * Configuration:
 *   - KHALTI_API_KEY        — Khalti merchant public key (live or test)
 *   - KHALTI_SECRET         — Khalti merchant secret key (server-to-server)
 *   - ESEWA_MERCHANT_CODE   — eSewa merchant code
 *   - ESEWA_SECRET          — eSewa secret for signature verification (production)
 *   - APP_BASE_URL          — Public base URL of the deployment (for return URLs)
 */

import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

const APP_BASE_URL = process.env.APP_BASE_URL || siteConfig.domain;

const KHALTI_BASE =
  process.env.KHALTI_ENV === "live"
    ? "https://api.khalti.com"
    : "https://a.khalti.com.np";

const ESEWA_BASE =
  process.env.ESEWA_ENV === "live"
    ? "https://esewa.com.np"
    : "https://uat.esewa.com.np";

// ============================================================
// KHALTI
// ============================================================

export async function initiateKhaltiPayment(opts: {
  paymentId: string;
  amount: number;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) {
  const apiKey = process.env.KHALTI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "Khalti is not configured. Set KHALTI_API_KEY in your environment.",
      fallback: "qr_whatsapp" as const,
    };
  }

  const payload = {
    return_url: `${APP_BASE_URL}/api/payments/khalti/return?paymentId=${opts.paymentId}`,
    website_url: APP_BASE_URL,
    amount: Math.round(opts.amount * 100),
    purchase_order_id: opts.paymentId,
    purchase_order_name: opts.description.slice(0, 150),
    customer_info: {
      name: opts.customerName.slice(0, 100),
      email: opts.customerEmail.slice(0, 100),
      phone: opts.customerPhone.slice(0, 20),
    },
  };

  try {
    const res = await fetch(`${KHALTI_BASE}/api/v2/epayment/initiate/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET || apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `Khalti error: ${text.slice(0, 200)}` };
    }

    const data = await res.json();
    return {
      success: true,
      paymentUrl: data.payment_url as string,
      pidx: data.pidx as string,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Khalti initiation failed",
    };
  }
}

export async function verifyKhaltiPayment(pidx: string, paymentId: string) {
  const secret = process.env.KHALTI_SECRET;
  if (!secret) {
    return { success: false, error: "KHALTI_SECRET not configured" };
  }

  // Fetch the payment from the DB first — never trust URL params blindly.
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    select: { id: true, amount: true, status: true, currency: true },
  });
  if (!payment) {
    return { success: false, error: "Payment record not found" };
  }
  // Idempotency: already paid, no-op success.
  if (payment.status === "PAID") {
    return { success: true, status: "PAID", idempotent: true };
  }
  if (payment.status !== "PENDING") {
    return { success: false, error: `Payment is ${payment.status}, cannot verify` };
  }

  try {
    const res = await fetch(`${KHALTI_BASE}/api/v2/epayment/lookup/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });

    if (!res.ok) {
      return { success: false, error: "Khalti lookup failed" };
    }

    const data = await res.json();
    if (data.status !== "Completed") {
      return { success: false, status: data.status };
    }

    // CRITICAL: verify the gateway-returned amount matches our DB record (in paisa).
    const expectedPaisa = Math.round(payment.amount * 100);
    const returnedPaisa = Math.round(Number(data.total_amount || 0));
    if (returnedPaisa !== expectedPaisa) {
      console.error(
        `Khalti amount mismatch for payment ${paymentId}: expected ${expectedPaisa}, got ${returnedPaisa}`
      );
      return { success: false, error: "Amount mismatch — payment rejected" };
    }

    await db.payment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        txnId: data.transaction_id,
        txnRef: pidx,
        metadata: JSON.stringify(data),
      },
    });
    return { success: true, status: "PAID" };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Khalti verification failed",
    };
  }
}

// ============================================================
// eSewa
// ============================================================

export async function initiateEsewaPayment(opts: {
  paymentId: string;
  amount: number;
  taxAmount?: number;
  serviceCharge?: number;
  deliveryCharge?: number;
  description: string;
}) {
  const merchantCode = process.env.ESEWA_MERCHANT_CODE;
  if (!merchantCode) {
    return {
      success: false,
      error: "eSewa is not configured. Set ESEWA_MERCHANT_CODE in your environment.",
      fallback: "qr_whatsapp" as const,
    };
  }

  const totalAmount =
    opts.amount + (opts.taxAmount || 0) + (opts.serviceCharge || 0) + (opts.deliveryCharge || 0);

  const params = new URLSearchParams({
    amt: opts.amount.toString(),
    psc: (opts.serviceCharge || 0).toString(),
    pdc: (opts.deliveryCharge || 0).toString(),
    txAmt: (opts.taxAmount || 0).toString(),
    tAmt: totalAmount.toString(),
    pid: opts.paymentId,
    scd: merchantCode,
    su: `${APP_BASE_URL}/api/payments/esewa/return?paymentId=${opts.paymentId}&status=success`,
    fu: `${APP_BASE_URL}/api/payments/esewa/return?paymentId=${opts.paymentId}&status=failure`,
  });

  return {
    success: true,
    paymentUrl: `${ESEWA_BASE}/epay/main?${params.toString()}`,
  };
}

export async function verifyEsewaPayment(opts: {
  paymentId: string;
  totalAmount: number;
  transactionRef: string;
}) {
  const merchantCode = process.env.ESEWA_MERCHANT_CODE;
  if (!merchantCode) {
    return { success: false, error: "ESEWA_MERCHANT_CODE not configured" };
  }

  // Fetch the payment from DB — never trust URL-supplied paymentId/amount alone.
  const payment = await db.payment.findUnique({
    where: { id: opts.paymentId },
    select: { id: true, amount: true, status: true },
  });
  if (!payment) {
    return { success: false, error: "Payment record not found" };
  }
  if (payment.status === "PAID") {
    return { success: true, status: "PAID", idempotent: true };
  }
  if (payment.status !== "PENDING") {
    return { success: false, error: `Payment is ${payment.status}, cannot verify` };
  }

  // CRITICAL: ignore the URL-supplied amount and use the DB amount for verification.
  const expectedAmount = payment.amount;

  const params = new URLSearchParams({
    amt: expectedAmount.toString(),
    rid: opts.transactionRef,
    pid: opts.paymentId,
    scd: merchantCode,
  });

  try {
    const res = await fetch(`${ESEWA_BASE}/epay/transrec?${params.toString()}`, {
      method: "GET",
    });
    const text = await res.text();
    if (res.ok && text.includes("Success")) {
      await db.payment.update({
        where: { id: opts.paymentId },
        data: {
          status: "PAID",
          txnRef: opts.transactionRef,
          metadata: JSON.stringify({ verified: true, raw: text.slice(0, 500) }),
        },
      });
      return { success: true, status: "PAID" };
    }
    return { success: false, status: text.slice(0, 200) };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "eSewa verification failed",
    };
  }
}

// ============================================================
// QR + WhatsApp proof (manual verification fallback)
// ============================================================
// Used by createBooking in contact.ts (which creates the PENDING payment inline).
// Admin marks PAID via the admin portal using markPaymentPaid below.

export async function markPaymentPaid(paymentId: string, txnRef?: string) {
  try {
    // Idempotent: only PENDING payments can be marked PAID.
    const existing = await db.payment.findUnique({
      where: { id: paymentId },
      select: { status: true },
    });
    if (!existing) {
      return { success: false, error: "Payment not found" };
    }
    if (existing.status === "PAID") {
      return { success: true, idempotent: true };
    }
    if (existing.status !== "PENDING") {
      return { success: false, error: `Payment is ${existing.status}` };
    }

    const payment = await db.payment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        txnRef: txnRef || `MANUAL-${Date.now()}`,
        updatedAt: new Date(),
      },
    });
    return { success: true, payment };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to mark payment as paid",
    };
  }
}
