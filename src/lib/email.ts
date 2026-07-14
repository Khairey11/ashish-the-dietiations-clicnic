/**
 * Email service — sends transactional emails.
 *
 * In development: logs emails to the console (no actual email sent).
 * In production: uses the Resend API (set RESEND_API_KEY env var).
 *
 * To enable real emails in production:
 *   1. bun add resend
 *   2. Set RESEND_API_KEY=re_xxx in .env
 *   3. Set FROM_EMAIL=care@thedietitiansclinic.com in .env
 */

import { siteConfig } from "@/lib/site-config";

type EmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const FROM_EMAIL = process.env.FROM_EMAIL || "care@thedietitiansclinic.health";

export async function sendEmail({ to, subject, html, text }: EmailParams): Promise<{ success: boolean; error?: string }> {
  // In development, just log
  if (process.env.NODE_ENV !== "production") {
    console.log("📧 EMAIL (dev mode — not actually sent)");
    console.log(`   To: ${to}`);
    console.log(`   From: ${FROM_EMAIL}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${text || html.slice(0, 200)}...`);
    return { success: true };
  }

  // In production, use Resend if configured
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — email not sent:", subject, "to", to);
    return { success: false, error: "Email service not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Email send failed:", res.status, errText);
      return { success: false, error: `Email API error: ${res.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send a booking confirmation email to the client.
 */
export async function sendBookingConfirmation(opts: {
  clientName: string;
  clientEmail: string;
  service: string;
  dietitian: string;
  date: string;
  time: string;
  program?: string;
  amount?: number;
}) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #28abe3 0%, #70a442 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed!</h1>
      </div>
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px;">Hi ${opts.clientName},</p>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
          Your consultation at The Dietitian's Clinic has been confirmed. Here are your appointment details:
        </p>
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${opts.service}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Dietitian</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${opts.dietitian}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${opts.date}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${opts.time} (Nepal Standard Time)</td></tr>
          ${opts.program ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Program</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${opts.program}</td></tr>` : ""}
          ${opts.amount ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">Rs. ${opts.amount.toLocaleString("en-IN")}</td></tr>` : ""}
        </table>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #15803d; font-size: 14px; font-weight: 600;">📋 Next steps</p>
          <p style="margin: 8px 0 0 0; color: #166534; font-size: 13px; line-height: 1.5;">
            1. Complete your payment via Khalti/eSewa or bank transfer<br>
            2. Send the payment screenshot to our WhatsApp: ${siteConfig.whatsappDisplay}<br>
            3. You'll receive a video call link 15 minutes before your appointment
          </p>
        </div>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          Need to reschedule? Reply to this email or call us at ${siteConfig.phoneDisplay}.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          The Dietitian's Clinic — Center for Clinical & Performance Nutrition<br>
          ${siteConfig.address}<br>
          ${siteConfig.phoneDisplay} · ${siteConfig.email}
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: opts.clientEmail,
    subject: `Booking Confirmed — ${opts.service} on ${opts.date}`,
    html,
    text: `Hi ${opts.clientName}, your consultation has been confirmed. Service: ${opts.service}, Dietitian: ${opts.dietitian}, Date: ${opts.date}, Time: ${opts.time}. Please complete payment and send screenshot to WhatsApp ${siteConfig.whatsappDisplay}.`,
  });
}

/**
 * Send a lead notification to the admin team.
 */
export async function sendLeadNotification(opts: {
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  message: string;
  service?: string;
}) {
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #28abe3;">New Lead from Website</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #6b7280;">Name:</td><td style="font-weight: 600;">${opts.leadName}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280;">Email:</td><td style="font-weight: 600;">${opts.leadEmail}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280;">Phone:</td><td style="font-weight: 600;">${opts.leadPhone}</td></tr>
        ${opts.service ? `<tr><td style="padding: 6px 0; color: #6b7280;">Service:</td><td style="font-weight: 600;">${opts.service}</td></tr>` : ""}
      </table>
      <p style="margin-top: 16px; padding: 12px; background: #f9fafb; border-radius: 8px;">${opts.message}</p>
      <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">Respond within 1 hour via WhatsApp or phone for best conversion.</p>
    </div>
  `;

  return sendEmail({
    to: siteConfig.email,
    subject: `New Lead: ${opts.leadName} — ${opts.service || "General inquiry"}`,
    html,
    text: `New lead from ${opts.leadName} (${opts.leadEmail}, ${opts.leadPhone}). Message: ${opts.message}`,
  });
}
