import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession, ADMIN_COOKIE } from "@/lib/auth";

/**
 * POST /api/admin/login
 * Body: { email, password }
 *
 * Verifies credentials against the User table (SUPER_ADMIN or DIETITIAN role).
 * On success, sets an httpOnly HMAC-signed session cookie.
 *
 * NOTE: Password verification uses scrypt (Node built-in) — no external deps.
 */
async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  // Hash format: "<salt>:<derived>" (hex)
  try {
    if (!hash.includes(":")) return false;
    const [salt, derived] = hash.split(":");
    const { scryptSync } = await import("node:crypto");
    const buf = scryptSync(plain, salt, 64);
    return buf.toString("hex") === derived;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.role !== "SUPER_ADMIN" && user.role !== "DIETITIAN") {
      return NextResponse.json(
        { success: false, error: "Account not authorized for admin access" },
        { status: 403 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await signSession(user.id);
    const res = NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
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
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
