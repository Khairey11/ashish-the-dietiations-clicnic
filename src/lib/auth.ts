import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Admin authentication using an HMAC-signed session cookie.
 *
 * Login flow:
 *   1. POST /api/admin/login with { email, password }
 *   2. Server verifies password against User.passwordHash (scrypt)
 *   3. Server sets httpOnly cookie `admin_session` = `<userId>.<hmac>`
 *   4. Subsequent admin requests verified via requireAdmin() / requireSuperAdmin()
 */

const COOKIE_NAME = "admin_session";

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET must be set in production");
  }
  return s || "dev-only-insecure-secret-please-set-ADMIN_SESSION_SECRET";
}

async function hmac(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Buffer.from(new Uint8Array(sig)).toString("base64url");
}

/** Constant-time comparison to prevent timing attacks. */
async function safeEqual(a: string, b: string): Promise<boolean> {
  if (a.length !== b.length) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  // Use Web Crypto verify which is constant-time
  const aBuf = enc.encode(a);
  const bBuf = enc.encode(b);
  // XOR comparison
  let result = 0;
  const aBytes = new Uint8Array(aBuf);
  const bBytes = new Uint8Array(bBuf);
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  void key; // suppress unused warning
  return result === 0;
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
  // Constant-time comparison to prevent timing attacks
  const ok = await safeEqual(sig, expected);
  if (!ok) return null;
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
    select: { id: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) {
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

/** Admin = SUPER_ADMIN or DIETITIAN (can view clients, appointments, leads). */
export async function requireAdmin(req: NextRequest): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const result = await requireUser(req, ["SUPER_ADMIN", "DIETITIAN"]);
  if (!result.ok) return result;
  return { ok: true, userId: result.userId };
}

/** Super admin only — for sensitive operations (payment config, clinic config, audit log, payment verification). */
export async function requireSuperAdmin(req: NextRequest): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const result = await requireUser(req, ["SUPER_ADMIN"]);
  if (!result.ok) return result;
  return { ok: true, userId: result.userId };
}

/** Client or staff — for client dashboard and payment initiation. */
export async function requireClient(req: NextRequest): Promise<
  { ok: true; userId: string; role: string } | { ok: false; response: NextResponse }
> {
  const result = await requireUser(req, ["CLIENT", "SUPER_ADMIN", "DIETITIAN"]);
  if (!result.ok) return result;
  return { ok: true, userId: result.userId, role: result.role };
}

export const ADMIN_COOKIE = COOKIE_NAME;
