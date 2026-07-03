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
 *
 * Until credentials are configured, the QR + WhatsApp proof flow is the default.
 * See `payments.ts` for the QR config and `getPaymentConfig()` for the runtime check.
 */

import * as React from "react";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

const APP_BASE_URL = process.env.APP_BASE_URL || siteConfig.domain;

// ============================================================
// KHALTI
// ============================================================
// Khalti docs: https://docs.khalti.com/
// Initiation endpoint: POST https://dev.khalti.com/api/v2/epayment/initiate/
// Verification:        POST https://dev.khalti.com/api/v2/epayment/lookup/
// Live base:           https://api.khalti.com

const KHALTI_BASE = process.env.KHALTI_ENV === "live"
  ? "https://api.khalti.com"
  : "https://a.khalti.com.np"; // dev/test host

export async function initiateKhaltiPayment(opts: {
  paymentId: string;        // Our internal Payment.id
  amount: number;           // In NPR (Khalti expects paise — multiply by 100)
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
      fallback: "qr_whatsapp",
    };
  }

  const payload = {
    return_url: `${APP_BASE_URL}/api/payments/khalti/return?paymentId=${opts.paymentId}`,
    website_url: APP_BASE_URL,
    amount: Math.round(opts.amount * 100), // Khalti wants paisa
    purchase_order_id: opts.paymentId,
    purchase_order_name: opts.description.slice(0, 150),
    customer_info: {
      name: opts.customerName,
      email: opts.customerEmail,
      phone: opts.customerPhone,
    },
  };

  try {
    const res = await fetch(`${KHALTI_BASE}/api/v2/epayment/initiate/`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.KHALTI_SECRET || apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `Khalti error: ${text}` };
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

  try {
    const res = await fetch(`${KHALTI_BASE}/api/v2/epayment/lookup/`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });

    if (!res.ok) {
      return { success: false, error: "Khalti lookup failed" };
    }

    const data = await res.json();
    if (data.status === "Completed") {
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
    }
    return { success: false, status: data.status };
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
// eSewa docs: https://developer.esewa.com.np/
// Test endpoint: https://uat.esewa.com.np/epay/main
// Live endpoint: https://esewa.com.np/epay/main
// Verification:  https://uat.esewa.com.np/epay/transrec / https://esewa.com.np/epay/transrec

const ESEWA_BASE = process.env.ESEWA_ENV === "live"
  ? "https://esewa.com.np"
  : "https://uat.esewa.com.np";

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
      fallback: "qr_whatsapp",
    };
  }

  // eSewa uses a form POST (not JSON). We return the URL + form fields for the
  // client to submit via a hidden form.
  const params = new URLSearchParams({
    amt: opts.amount.toString(),
    psc: (opts.serviceCharge || 0).toString(),
    pdc: (opts.deliveryCharge || 0).toString(),
    txAmt: (opts.taxAmount || 0).toString(),
    tAmt: (opts.amount + (opts.taxAmount || 0) + (opts.serviceCharge || 0) + (opts.deliveryCharge || 0)).toString(),
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

  const params = new URLSearchParams({
    amt: (opts.totalAmount).toString(),
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
          metadata: JSON.stringify({ verified: true, raw: text }),
        },
      });
      return { success: true, status: "PAID" };
    }
    return { success: false, status: text };
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
// This is the default flow when API credentials are not configured.
// The booking UI shows the QR (uploaded by admin) + an "I've paid — send proof
// on WhatsApp" button. The Payment row stays PENDING until admin verifies the
// screenshot and marks it PAID via the admin portal.

export async function createPendingQrPayment(opts: {
  clientId: string;
  programId?: string;
  amount: number;
  method: "KHALTI" | "ESEWA" | "BANK_TRANSFER";
  bookingRef: string;
}) {
  const payment = await db.payment.create({
    data: {
      clientId: opts.clientId,
      programId: opts.programId,
      amount: opts.amount,
      currency: "NPR",
      method: opts.method,
      status: "PENDING",
      txnRef: `QR-${opts.bookingRef}`,
      metadata: JSON.stringify({
        mode: "qr_whatsapp",
        bookingRef: opts.bookingRef,
        createdAt: new Date().toISOString(),
      }),
    },
  });
  return { success: true, paymentId: payment.id };
}

export async function markPaymentPaid(paymentId: string, txnRef?: string) {
  try {
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
