import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { randomBytes } from "node:crypto";

const schema = z.object({
  email: z.string().email("Valid email is required"),
});

/**
 * POST /api/auth/forgot-password
 * Generates a password reset token and stores it.
 * In development: logs the reset link to console.
 * In production: sends via email (requires RESEND_API_KEY).
 */
export async function POST(req: NextRequest) {
  // Rate limit: 3 attempts per hour per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `forgot:${ip}`, limit: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, role: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, a reset link has been sent.",
      });
    }

    // Generate a secure token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Delete any existing reset tokens for this user
    await db.passwordReset.deleteMany({ where: { userId: user.id } });

    // Create new reset token
    await db.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // In development, log the reset link
    const resetUrl = `${process.env.APP_BASE_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    if (process.env.NODE_ENV !== "production") {
      console.log("🔐 PASSWORD RESET LINK (dev mode):");
      console.log(`   ${resetUrl}`);
    } else {
      // In production, send via email
      const { sendEmail } = await import("@/lib/email");
      await sendEmail({
        to: email,
        subject: "Password Reset — Ashish Nutrition Clinic",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #28abe3;">Password Reset Request</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #28abe3; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
            <p style="color: #6b7280; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
        text: `Reset your password: ${resetUrl}`,
      }).catch((err) => {
        // Log the error so ops can monitor email failures, but don't expose
        // the failure to the user (to prevent email-enumeration via the
        // forgot-password endpoint).
        console.error("Password reset email failed to send:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
