import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { hashPassword } from "@/lib/password";

const schema = z.object({
  token: z.string().min(32, "Invalid token"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

/**
 * POST /api/auth/reset-password
 * Resets the user's password using a valid token.
 */
export async function POST(req: NextRequest) {
  // Rate limit: 5 attempts per hour per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `reset:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
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
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    // Find the reset token
    const reset = await db.passwordReset.findUnique({
      where: { token: parsed.data.token },
    });

    if (!reset) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (reset.expiresAt < new Date()) {
      await db.passwordReset.delete({ where: { id: reset.id } });
      return NextResponse.json(
        { success: false, error: "Token has expired. Please request a new reset link." },
        { status: 400 }
      );
    }

    // Check if token was already used
    if (reset.usedAt) {
      return NextResponse.json(
        { success: false, error: "This reset link has already been used." },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = hashPassword(parsed.data.password);

    // Update the user's password
    await db.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    });

    // Mark the token as used
    await db.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
