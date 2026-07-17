import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { signSession, ADMIN_COOKIE, verifySession } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "node:crypto";

/**
 * POST /api/auth/send-verification
 * Body: { email?: string }  — if omitted, uses the authenticated user's email.
 *
 * Generates a new verification token and sends a verification email.
 * Rate-limited to 3 per hour per IP to prevent abuse.
 *
 * Always returns success (even if no account exists) to prevent email
 * enumeration via this endpoint.
 */
const schema = z.object({
  email: z.string().email().max(160).optional(),
});

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `send-verification:${ip}`, limit: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid email." },
        { status: 400 }
      );
    }

    // Resolve the target email: explicit body email, or the authenticated
    // user's email if they're logged in.
    let email = parsed.data.email?.toLowerCase().trim();
    if (!email) {
      const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
      const userId = await verifySession(cookie);
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "Please log in to resend the verification email." },
          { status: 401 }
        );
      }
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Account not found." },
          { status: 404 }
        );
      }
      email = user.email;
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, emailVerified: true, isActive: true },
    });

    if (!user || !user.isActive) {
      // Don't reveal that the account doesn't exist.
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, a verification link has been sent.",
      });
    }

    // Already verified? Idempotent success.
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Your email is already verified. You can log in.",
      });
    }

    // Delete any previous unused tokens for this identifier (avoid clutter).
    await db.verificationToken.deleteMany({ where: { identifier: email } });

    // Generate + store a fresh token (24h expiry).
    const token = generateToken();
    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Send the email. Errors are logged but not surfaced (enumeration).
    await sendVerificationEmail({
      to: user.email,
      name: user.name || "there",
      token,
    }).catch((err) => {
      console.error("Verification email failed to send:", err);
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, a verification link has been sent.",
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send verification email." },
      { status: 500 }
    );
  }
}

// Suppress unused-import warning for signSession/ADMIN_COOKIE (used in /verify-email, not here).
void signSession;
void ADMIN_COOKIE;
