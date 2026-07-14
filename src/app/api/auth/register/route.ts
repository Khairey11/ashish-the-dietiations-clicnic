import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { signSession, ADMIN_COOKIE } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { rateLimit, getClientIp } from "@/lib/ratelimit";

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

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: lowerEmail },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please log in instead." },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = hashPassword(password);

    // Create the user with CLIENT role + empty patient record
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
        title: "Welcome to The Dietitian's Clinic!",
        body: "Complete your health assessment to get started with your personalized nutrition plan.",
        link: "/dashboard/onboarding",
      },
    });

    // Sign the session
    const token = await signSession(user.id);
    const res = NextResponse.json({
      success: true,
      data: user,
      message: "Account created successfully!",
    });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
