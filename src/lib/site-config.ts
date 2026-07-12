// Central site configuration for The Dietitian's Clinic.
// Update these constants to match your real clinic details.
// These are also mirrored in the database (SiteSetting table) for admin-editable overrides.

export const siteConfig = {
  name: "The Dietitian's Clinic",
  shortName: "TDC",
  tagline: "Center for Clinical & Performance Nutrition",
  domain: "https://thedietitiansclinic.com",

  // ===== Contact =====
  // Use international format without "+" or spaces for wa.me / tel: links
  phoneDisplay: "+977-1-4445566",          // Display format
  phoneRaw: "+97714445566",                // tel: link
  whatsappDisplay: "+977 9800000000",      // Display format
  whatsappRaw: "9779800000000",            // wa.me link (no +, no spaces)
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

  // ===== Payment defaults (can be overridden in DB via admin settings) =====
  payments: {
    khaltiMobile: "9800000000",
    esewaId: "thedietitiansclinic",
    bankName: "Nepal Investment Mega Bank",
    bankAccountName: "The Dietitian's Clinic Pvt. Ltd.",
    bankAccountNumber: "01234567890123",
    bankBranch: "Dharan Branch",
  },
} as const;

// ===== Helpers =====

/**
 * Build a wa.me link with an optional prefilled message.
 * @param message - Optional prefilled chat message
 */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${siteConfig.whatsappRaw}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Build a tel: link from the clinic phone number.
 */
export function phoneLink(): string {
  return `tel:${siteConfig.phoneRaw.replace(/[^0-9+]/g, "")}`;
}

/**
 * Build a mailto: link with an optional subject + body.
 */
export function emailLink(subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  return `mailto:${siteConfig.email}${qs ? `?${qs}` : ""}`;
}

/**
 * Default prefilled WhatsApp message used by the floating button.
 */
export const defaultWhatsappMessage =
  `Hi ${siteConfig.name}! I'd like to know more about your nutrition programs and book a consultation.`;

/**
 * Build a prefilled WhatsApp message for payment proof after a booking.
 */
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
