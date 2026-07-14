import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession, ADMIN_COOKIE } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/ratelimit";

/**
 * GET /api/auth/verify-email?token=...
 * Validates an email verification token and marks the user's email as verified.
 * If the user is not already logged in, sets a session cookie so they land on
 * their dashboard already authenticated.
 *
 * Tokens are stored in the VerificationToken table (identifier = user email,
 * token = random URL-safe string, expires = 24h from issue).
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `verify-email:${ip}`, limit: 20, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const token = req.nextUrl.searchParams.get("token");
  if (!token || token.length < 16) {
    return NextResponse.json(
      { success: false, error: "Invalid verification token." },
      { status: 400 }
    );
  }

  try {
    const record = await db.verificationToken.findUnique({
      where: { token },
    });
    if (!record) {
      return NextResponse.json(
        { success: false, error: "This verification link is invalid or has already been used." },
        { status: 400 }
      );
    }
    if (record.expires < new Date()) {
      // Clean up the expired token.
      await db.verificationToken.delete({ where: { token } }).catch(() => {});
      return NextResponse.json(
        { success: false, error: "This verification link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find the user by identifier (email).
    const user = await db.user.findUnique({
      where: { email: record.identifier },
      select: { id: true, email: true, name: true, role: true, isActive: true, emailVerified: true },
    });
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: "Account not found." },
        { status: 404 }
      );
    }

    // Mark email as verified + delete the token (single-use).
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      db.verificationToken.delete({ where: { token } }),
    ]);

    // If the user isn't already logged in, set a session cookie so they land
    // on their dashboard authenticated. If they ARE logged in (e.g. they
    // clicked the link from the same browser they registered in), the
    // existing cookie is fine — no need to re-issue.
    const existingCookie = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!existingCookie) {
      const sessionToken = await signSession(user.id);
      const res = NextResponse.json({
        success: true,
        message: "Email verified successfully!",
        data: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
      res.cookies.set(ADMIN_COOKIE, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
