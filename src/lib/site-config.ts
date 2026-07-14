// Central site configuration for The Dietitian's Clinic.
// These are the FALLBACK values. The admin can override them via /admin/settings
// (stored in the SiteSetting table). Use getDynamicConfig() in server components
// to fetch the DB-overridden values.

import { db } from "@/lib/db";

export const siteConfig = {
  name: "The Dietitian's Clinic",
  shortName: "TDC",
  tagline: "Center for Clinical & Performance Nutrition",
  domain: "https://thedietitiansclinic.com",

  // ===== Contact (fallbacks — overridden by DB in getDynamicConfig) =====
  phoneDisplay: "+977-1-4445566",
  phoneRaw: "+97714445566",
  whatsappDisplay: "+977 9800000000",
  whatsappRaw: "9779800000000",
  email: "care@thedietitiansclinic.com",
  address: "Dharan-14, Sunsari, Nepal",

  // ===== Hours =====
  weekdayHours: "7:00 AM – 8:00 PM",
  saturdayHours: "8:00 AM – 6:00 PM",

  // ===== Social =====
  social: {
    instagram: "https://instagram.com/thedietitiansclinic",
    facebook: "https://facebook.com/thedietitiansclinic",
    twitter: "https://twitter.com/tdc_health",
    youtube: "https://youtube.com/@thedietitiansclinic",
    linkedin: "https://linkedin.com/company/thedietitiansclinic",
  },

  // ===== Payment defaults =====
  payments: {
    khaltiMobile: "9800000000",
    esewaId: "thedietitiansclinic",
    bankName: "Nepal Investment Mega Bank",
    bankAccountName: "The Dietitian's Clinic Pvt. Ltd.",
    bankAccountNumber: "01234567890123",
    bankBranch: "Dharan Branch",
  },
} as const;

export type DynamicConfig = {
  name: string;
  phoneDisplay: string;
  phoneRaw: string;
  whatsappDisplay: string;
  whatsappRaw: string;
  email: string;
  address: string;
  weekdayHours: string;
  saturdayHours: string;
  social: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
};

/**
 * Fetches the site configuration from the database (admin-editable overrides)
 * with fallback to the static siteConfig values.
 * MUST be called in a server component or server action.
 */
export async function getDynamicConfig(): Promise<DynamicConfig> {
  try {
    const settings = await db.siteSetting.findMany({
      where: {
        key: {
          in: [
            "clinic_name", "clinic_phone_display", "clinic_phone_raw",
            "clinic_whatsapp_display", "clinic_whatsapp_raw", "clinic_email",
            "clinic_address", "clinic_weekday_hours", "clinic_saturday_hours",
            "social_instagram", "social_facebook", "social_twitter",
            "social_youtube", "social_linkedin",
          ],
        },
      },
    });
    const map = new Map(settings.map((s) => [s.key, s.value]));
    const get = (key: string, fallback: string) => map.get(key) || fallback;

    return {
      name: get("clinic_name", siteConfig.name),
      phoneDisplay: get("clinic_phone_display", siteConfig.phoneDisplay),
      phoneRaw: get("clinic_phone_raw", siteConfig.phoneRaw),
      whatsappDisplay: get("clinic_whatsapp_display", siteConfig.whatsappDisplay),
      whatsappRaw: get("clinic_whatsapp_raw", siteConfig.whatsappRaw),
      email: get("clinic_email", siteConfig.email),
      address: get("clinic_address", siteConfig.address),
      weekdayHours: get("clinic_weekday_hours", siteConfig.weekdayHours),
      saturdayHours: get("clinic_saturday_hours", siteConfig.saturdayHours),
      social: {
        instagram: get("social_instagram", siteConfig.social.instagram),
        facebook: get("social_facebook", siteConfig.social.facebook),
        twitter: get("social_twitter", siteConfig.social.twitter),
        youtube: get("social_youtube", siteConfig.social.youtube),
        linkedin: get("social_linkedin", siteConfig.social.linkedin),
      },
    };
  } catch {
    // DB not available — return static config
    return {
      name: siteConfig.name,
      phoneDisplay: siteConfig.phoneDisplay,
      phoneRaw: siteConfig.phoneRaw,
      whatsappDisplay: siteConfig.whatsappDisplay,
      whatsappRaw: siteConfig.whatsappRaw,
      email: siteConfig.email,
      address: siteConfig.address,
      weekdayHours: siteConfig.weekdayHours,
      saturdayHours: siteConfig.saturdayHours,
      social: { ...siteConfig.social },
    };
  }
}

// ===== Helpers (use static config for client-side, dynamic for server-side) =====

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${siteConfig.whatsappRaw}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function whatsappLinkFromConfig(config: { whatsappRaw: string }, message?: string): string {
  const base = `https://wa.me/${config.whatsappRaw}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function phoneLink(): string {
  return `tel:${siteConfig.phoneRaw.replace(/[^0-9+]/g, "")}`;
}

export function phoneLinkFromConfig(config: { phoneRaw: string }): string {
  return `tel:${config.phoneRaw.replace(/[^0-9+]/g, "")}`;
}

export function emailLink(subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  return `mailto:${siteConfig.email}${qs ? `?${qs}` : ""}`;
}

export function emailLinkFromConfig(config: { email: string }, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  return `mailto:${config.email}${qs ? `?${qs}` : ""}`;
}

export const defaultWhatsappMessage =
  `Hi ${siteConfig.name}! I'd like to know more about your nutrition programs and book a consultation.`;

export function paymentProofMessage(opts: {
  clientName: string;
  service?: string;
  dietitian?: string;
  date?: string;
  time?: string;
  program?: string;
  amount?: number | string;
  method?: string;
}): string {
  const lines = [
    `Hi ${siteConfig.name}! I've just completed my booking.`,
    "",
    `*Booking details:*`,
    `• Name: ${opts.clientName}`,
    opts.service ? `• Service: ${opts.service}` : null,
    opts.dietitian ? `• Dietitian: ${opts.dietitian}` : null,
    opts.date ? `• Date: ${opts.date}` : null,
    opts.time ? `• Time: ${opts.time}` : null,
    opts.program ? `• Program: ${opts.program}` : null,
    opts.amount ? `• Amount: Rs. ${opts.amount}` : null,
    opts.method ? `• Payment method: ${opts.method}` : null,
    "",
    "*Payment screenshot is attached.* Please verify and confirm my appointment. Thank you! 🙏",
  ].filter(Boolean);
  return lines.join("\n");
}
