"use server";

import * as React from "react";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

/**
 * Payment configuration returned to the booking UI.
 * Sourced from SiteSetting (admin-editable) with fallback to siteConfig defaults.
 */
export type PaymentConfig = {
  khalti: {
    enabled: boolean;
    merchantMobile: string;
    qrUrl: string | null;
    apiKeyConfigured: boolean;   // true if KHALTI_API_KEY env or DB row is set
  };
  esewa: {
    enabled: boolean;
    id: string;
    qrUrl: string | null;
    merchantCodeConfigured: boolean;
  };
  bank: {
    enabled: boolean;
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
    qrUrl: string | null;
  };
  proofMode: "whatsapp" | "upload";
  instructions: string;
  whatsappNumber: string;        // Display
  whatsappRaw: string;           // For wa.me links
};

/**
 * Fetch payment config from the database (with sensible fallbacks).
 * Server-only — never expose API keys/secret to the client.
 */
export async function getPaymentConfig(): Promise<PaymentConfig> {
  const settings = await db.siteSetting.findMany({
    where: {
      key: { startsWith: "payment_" },
    },
  });

  // Build a key→value map for O(1) lookup
  const map = new Map<string, string>();
  for (const s of settings) map.set(s.key, s.value);

  const get = (key: string, fallback = ""): string => map.get(key) || fallback;
  const getBool = (key: string, fallback = true): boolean => {
    const v = map.get(key);
    if (v === undefined) return fallback;
    return v === "true" || v === "1";
  };

  // Detect env-based credentials (never expose the values themselves)
  const khaltiApiKey = process.env.KHALTI_API_KEY || get("payment_khalti_api_key");
  const esewaMerchantCode = process.env.ESEWA_MERCHANT_CODE || get("payment_esewa_merchant_code");

  return {
    khalti: {
      enabled: getBool("payment_khalti_enabled", true),
      merchantMobile: get("payment_khalti_merchant_mobile", siteConfig.payments.khaltiMobile),
      qrUrl: get("payment_khalti_qr_url") || null,
      apiKeyConfigured: !!khaltiApiKey,
    },
    esewa: {
      enabled: getBool("payment_esewa_enabled", true),
      id: get("payment_esewa_id", siteConfig.payments.esewaId),
      qrUrl: get("payment_esewa_qr_url") || null,
      merchantCodeConfigured: !!esewaMerchantCode,
    },
    bank: {
      enabled: getBool("payment_bank_enabled", true),
      bankName: get("payment_bank_name", siteConfig.payments.bankName),
      accountName: get("payment_bank_account_name", siteConfig.payments.bankAccountName),
      accountNumber: get("payment_bank_account_number", siteConfig.payments.bankAccountNumber),
      branch: get("payment_bank_branch", siteConfig.payments.bankBranch),
      qrUrl: get("payment_bank_qr_url") || null,
    },
    proofMode: (get("payment_proof_mode", "whatsapp") as "whatsapp" | "upload"),
    instructions: get(
      "payment_instructions",
      "After paying, please send the screenshot to our WhatsApp to confirm your booking."
    ),
    whatsappNumber: get("whatsapp_number", siteConfig.whatsappDisplay),
    whatsappRaw: get("whatsapp_raw", siteConfig.whatsappRaw),
  };
}

/**
 * Update payment config (called from admin settings page).
 * Only the QR URLs, merchant mobile, eSewa ID, bank details, instructions, and
 * proof mode are admin-editable. API keys/secrets must be set via env vars.
 */
export async function updatePaymentConfig(input: {
  khaltiMerchantMobile?: string;
  khaltiQrUrl?: string;
  esewaId?: string;
  esewaQrUrl?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  bankQrUrl?: string;
  proofMode?: "whatsapp" | "upload";
  instructions?: string;
}) {
  const updates: { key: string; value: string }[] = [];

  if (input.khaltiMerchantMobile !== undefined)
    updates.push({ key: "payment_khalti_merchant_mobile", value: input.khaltiMerchantMobile });
  if (input.khaltiQrUrl !== undefined)
    updates.push({ key: "payment_khalti_qr_url", value: input.khaltiQrUrl });
  if (input.esewaId !== undefined)
    updates.push({ key: "payment_esewa_id", value: input.esewaId });
  if (input.esewaQrUrl !== undefined)
    updates.push({ key: "payment_esewa_qr_url", value: input.esewaQrUrl });
  if (input.bankName !== undefined)
    updates.push({ key: "payment_bank_name", value: input.bankName });
  if (input.bankAccountName !== undefined)
    updates.push({ key: "payment_bank_account_name", value: input.bankAccountName });
  if (input.bankAccountNumber !== undefined)
    updates.push({ key: "payment_bank_account_number", value: input.bankAccountNumber });
  if (input.bankBranch !== undefined)
    updates.push({ key: "payment_bank_branch", value: input.bankBranch });
  if (input.bankQrUrl !== undefined)
    updates.push({ key: "payment_bank_qr_url", value: input.bankQrUrl });
  if (input.proofMode !== undefined)
    updates.push({ key: "payment_proof_mode", value: input.proofMode });
  if (input.instructions !== undefined)
    updates.push({ key: "payment_instructions", value: input.instructions });

  for (const u of updates) {
    await db.siteSetting.upsert({
      where: { key: u.key },
      update: { value: u.value },
      create: { key: u.key, value: u.value },
    });
  }

  return { success: true, updated: updates.length };
}
