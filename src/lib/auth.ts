import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Lightweight admin authentication using a signed session cookie.
 *
 * Why not NextAuth? The project is a small clinic site with a single admin.
 * NextAuth (already a heavy dep) is overkill and was never wired up. This
 * helper uses an HMAC-signed cookie verified against the admin user record
 * in the database. The signing secret is ADMIN_SESSION_SECRET (env) with a
 * build-time fallback so dev still works without env config.
 *
 * Login flow:
 *   1. POST /api/admin/login with { email, password }
 *   2. Server verifies password against User.passwordHash (bcrypt)
 *   3. Server sets httpOnly cookie `admin_session` = `<userId>.<hmac>`
 *   4. Subsequent admin requests verified via requireAdmin()
 */

const COOKIE_NAME = "admin_session";

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dev-only-insecure-secret-please-set-ADMIN_SESSION_SECRET"
  );
}

async function hmac(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Buffer.from(new Uint8Array(sig)).toString("base64url");
}

export async function signSession(userId: string): Promise<string> {
  return `${userId}.${await hmac(userId, getSecret())}`;
}

export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx < 1) return null;
  const userId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = await hmac(userId, getSecret());
  if (sig !== expected) return null;
  return userId;
}

export async function requireUser(
  req: NextRequest,
  allowedRoles?: Array<"SUPER_ADMIN" | "DIETITIAN" | "CLIENT" | "NUTRITIONIST" | "RECEPTIONIST" | "MANAGER" | "CONTENT_MANAGER" | "FINANCE">
): Promise<
  { ok: true; userId: string; role: string } | { ok: false; response: NextResponse }
> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const userId = await verifySession(token);
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      ),
    };
  }
  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      ),
    };
  }
  return { ok: true, userId: user.id, role: user.role };
}

export async function requireAdmin(req: NextRequest): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const result = await requireUser(req, ["SUPER_ADMIN", "DIETITIAN"]);
  if (!result.ok) return result;
  return { ok: true, userId: result.userId };
}

export async function requireClient(req: NextRequest): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const result = await requireUser(req, ["CLIENT", "SUPER_ADMIN", "DIETITIAN"]);
  if (!result.ok) return result;
  return { ok: true, userId: result.userId };
}

export const ADMIN_COOKIE = COOKIE_NAME;
