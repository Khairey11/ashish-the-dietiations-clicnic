import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { signSession, ADMIN_COOKIE } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { sendVerificationEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  email: z.string().email("Valid email is required").max(160),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  phone: z.string().min(7, "Valid phone is required").max(32),
});

/**
 * POST /api/auth/register
 * Creates a new CLIENT user account and logs them in.
 */
export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per hour per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `register:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
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

    const { name, email, password, phone } = parsed.data;
    const lowerEmail = email.toLowerCase();

    // Check if user already exists.
    const existing = await db.user.findUnique({
      where: { email: lowerEmail },
      select: { id: true, passwordHash: true, role: true, isActive: true, emailVerified: true },
    });

    if (existing) {
      // If the existing user has a passwordHash, they've already registered —
      // tell them to log in instead.
      if (existing.passwordHash) {
        return NextResponse.json(
          { success: false, error: "An account with this email already exists. Please log in instead." },
          { status: 409 }
        );
      }
      // If the existing user has NO passwordHash, they were created by a
      // booking/lead action. Allow them to "claim" the account by setting
      // their password now.
      const passwordHash = hashPassword(password);
      await db.user.update({
        where: { id: existing.id },
        data: {
          name,
          phone,
          passwordHash,
          isActive: true,
        },
      });

      // Create welcome notification
      await db.notification.create({
        data: {
          userId: existing.id,
          type: "WELCOME",
          title: "Welcome to Ashish Nutrition Clinic!",
          body: "Complete your health assessment to get started with your personalized nutrition plan.",
          link: "/dashboard/onboarding",
        },
      });

      // Send verification email if their email isn't verified yet.
      if (!existing.emailVerified) {
        const verifyToken = randomBytes(32).toString("hex");
        await db.verificationToken.create({
          data: {
            identifier: lowerEmail,
            token: verifyToken,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
        sendVerificationEmail({
          to: lowerEmail,
          name,
          token: verifyToken,
        }).catch((err) => {
          console.error("Failed to send verification email:", err);
        });
      }

      // Re-fetch the user to get the current sessionVersion (the update above
      // may have modified the row).
      const claimed = await db.user.findUnique({
        where: { id: existing.id },
        select: { sessionVersion: true },
      });

      // Sign the session
      const token = await signSession(existing.id, claimed?.sessionVersion ?? 0);
      const res = NextResponse.json({
        success: true,
        data: { id: existing.id, name, email: lowerEmail, role: existing.role },
        message: existing.emailVerified
          ? "Account claimed successfully!"
          : "Account claimed! Check your inbox to verify your email.",
      });
      res.cookies.set(ADMIN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    // No existing user — create a new one.
    const passwordHash = hashPassword(password);

    // Create the user with CLIENT role + empty patient record.
    // emailVerified is left null — the user must click the verification link
    // we send to their inbox before they can access the dashboard.
    const user = await db.user.create({
      data: {
        email: lowerEmail,
        name,
        phone,
        role: "CLIENT",
        isActive: true,
        passwordHash,
        patient: {
          create: {
            primaryGoal: "",
            condition: "",
            onboardingCompleted: false,
          },
        },
      },
      select: { id: true, name: true, email: true, role: true },
    });

    // Create welcome notification
    await db.notification.create({
      data: {
        userId: user.id,
        type: "WELCOME",
        title: "Welcome to Ashish Nutrition Clinic!",
        body: "Complete your health assessment to get started with your personalized nutrition plan.",
        link: "/dashboard/onboarding",
      },
    });

    // Generate + store an email verification token (24h expiry).
    const verifyToken = randomBytes(32).toString("hex");
    await db.verificationToken.create({
      data: {
        identifier: lowerEmail,
        token: verifyToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Send the verification email (non-blocking — don't block registration).
    sendVerificationEmail({
      to: lowerEmail,
      name,
      token: verifyToken,
    }).catch((err) => {
      console.error("Failed to send verification email:", err);
    });

    // Sign the session — the user is logged in but the dashboard will show a
    // "verify your email" banner until they click the link.
    // sessionVersion is 0 for a brand-new user (schema default).
    const token = await signSession(user.id, 0);
    const res = NextResponse.json({
      success: true,
      data: user,
      message: "Account created! Check your inbox to verify your email.",
    });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
