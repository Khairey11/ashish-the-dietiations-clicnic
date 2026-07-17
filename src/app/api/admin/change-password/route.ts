import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, signSession, ADMIN_COOKIE } from "@/lib/auth";
import { verifyPassword, hashPassword } from "@/lib/password";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
});

/**
 * POST /api/admin/change-password
 * Changes the logged-in user's password.
 *
 * On success, bumps `sessionVersion` — this invalidates all other session
 * cookies for this user (forced logout everywhere else). The current browser
 * gets a fresh session cookie so they stay logged in.
 */
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, passwordHash: true, sessionVersion: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const ok = verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash the new password + bump sessionVersion in a single update.
    const newHash = hashPassword(parsed.data.newPassword);
    const newVersion = user.sessionVersion + 1;
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash, sessionVersion: newVersion },
    });

    await writeAuditLog({
      userId: auth.userId,
      action: "PASSWORD_CHANGED",
      entity: "User",
      entityId: user.id,
      after: { sessionVersionBumped: true },
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
    });

    // Issue a fresh session cookie with the new version so the current browser
    // stays logged in. All other sessions for this user are now invalid.
    const token = await signSession(user.id, newVersion);
    const res = NextResponse.json({ success: true, message: "Password changed successfully" });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to change password" },
      { status: 500 }
    );
  }
}
