import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";

/**
 * Authentication using an HMAC-signed session cookie.
 *
 * Session token format: `<userId>.<sessionVersion>.<hmac(userId.sessionVersion, secret)>`
 *
 * The `sessionVersion` is bumped on password change / forced logout. Including
 * it in the HMAC payload means any existing session cookie becomes invalid
 * the moment the version changes — enabling instant session invalidation
 * without a server-side session store.
 *
 * Login flow:
 *   1. POST /api/admin/login (or /api/auth/register) with { email, password }
 *   2. Server verifies password against User.passwordHash (scrypt)
 *   3. Server sets httpOnly cookie `admin_session` = signed token
 *   4. Subsequent requests verified via requireUser / requireAdmin / etc.
 *
 * Role helpers:
 *   - requireUser(roles?)      — any authenticated user; optionally restrict to roles
 *   - requireClient            — CLIENT only (client dashboard, payments, measurements)
 *   - requireClientOrStaff     — CLIENT + any staff role (file upload)
 *   - requireAdmin             — SUPER_ADMIN + DIETITIAN (clinical data: appointments, clients)
 *   - requireContentEditor     — SUPER_ADMIN + CONTENT_MANAGER (blog, testimonials, newsletter)
 *   - requireSuperAdmin        — SUPER_ADMIN only (payment config, clinic config, audit log)
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

/** Constant-time string comparison to prevent timing attacks. */
async function safeEqual(a: string, b: string): Promise<boolean> {
  if (a.length !== b.length) return false;
  const enc = new TextEncoder();
  const aBytes = new Uint8Array(enc.encode(a));
  const bBytes = new Uint8Array(enc.encode(b));
  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  return result === 0;
}

/**
 * Sign a session token for a user.
 * Format: `<userId>.<sessionVersion>.<hmac>`.
 *
 * The sessionVersion is fetched from the DB at sign time. To invalidate all
 * existing sessions for a user, bump their `sessionVersion` (e.g. on password
 * change) and any pre-existing cookie will fail verification.
 */
export async function signSession(userId: string, sessionVersion: number = 0): Promise<string> {
  const payload = `${userId}.${sessionVersion}`;
  const sig = await hmac(payload, getSecret());
  return `${payload}.${sig}`;
}

/**
 * Verify a session token. Returns the userId on success, null otherwise.
 *
 * Note: this only verifies the HMAC signature. It does NOT check that
 * sessionVersion matches the current DB value — that check happens in
 * requireUser() below, which fetches the user record anyway for role/isActive.
 */
export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  // Token format: `<userId>.<sessionVersion>.<hmac>`. userId is a cuid (no dots),
  // so we split on "." and expect exactly 3 parts.
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, versionStr, sig] = parts;
  if (!userId || !versionStr || !sig) return null;
  const payload = `${userId}.${versionStr}`;
  const expected = await hmac(payload, getSecret());
  const ok = await safeEqual(sig, expected);
  if (!ok) return null;
  return userId;
}

// All valid roles from the Prisma enum.
const ALL_ROLES: UserRole[] = [
  "SUPER_ADMIN", "DIETITIAN", "NUTRITIONIST", "RECEPTIONIST",
  "MANAGER", "CONTENT_MANAGER", "FINANCE", "CLIENT",
];

export async function requireUser(
  req: NextRequest,
  allowedRoles?: UserRole[]
): Promise<
  { ok: true; userId: string; role: UserRole } | { ok: false; response: NextResponse }
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
  // Extract the sessionVersion baked into the cookie so we can compare it
  // against the DB value. If they differ, the session was invalidated
  // (password changed, forced logout) and we reject.
  const cookieVersion = token ? parseInt(token.split(".")[1] || "NaN", 10) : NaN;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true, sessionVersion: true },
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
  if (!Number.isFinite(cookieVersion) || cookieVersion !== user.sessionVersion) {
    // Session version mismatch — reject as 401 so the client redirects to /login.
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Session expired. Please log in again." },
        { status: 401 }
      ),
    };
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
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

/** Client only — for client dashboard, measurements, onboarding, meal plans, payment initiation. */
export async function requireClient(req: NextRequest): Promise<
  { ok: true; userId: string; role: UserRole } | { ok: false; response: NextResponse }
> {
  const result = await requireUser(req, ["CLIENT"]);
  if (!result.ok) return result;
  return { ok: true, userId: result.userId, role: result.role };
}

/** Client or any staff role — for file upload (used by both clients and admins). */
export async function requireClientOrStaff(req: NextRequest): Promise<
  { ok: true; userId: string; role: UserRole } | { ok: false; response: NextResponse }
> {
  const result = await requireUser(req, ALL_ROLES);
  if (!result.ok) return result;
  return { ok: true, userId: result.userId, role: result.role };
}

/** Clinical staff — SUPER_ADMIN or DIETITIAN. Can view clients, appointments, leads.
 *  NOTE: dietitian access to individual client records should be scoped to their
 *  own patients at the route level (see /api/admin/clients/[id]). */
export async function requireAdmin(req: NextRequest): Promise<
  { ok: true; userId: string; role: UserRole } | { ok: false; response: NextResponse }
> {
  const result = await requireUser(req, ["SUPER_ADMIN", "DIETITIAN"]);
  if (!result.ok) return result;
  return { ok: true, userId: result.userId, role: result.role };
}

/** Content management — SUPER_ADMIN or CONTENT_MANAGER. For blog, testimonials, newsletter. */
export async function requireContentEditor(req: NextRequest): Promise<
  { ok: true; userId: string; role: UserRole } | { ok: false; response: NextResponse }
> {
  const result = await requireUser(req, ["SUPER_ADMIN", "CONTENT_MANAGER"]);
  if (!result.ok) return result;
  return { ok: true, userId: result.userId, role: result.role };
}

/** Super admin only — for sensitive operations (payment config, clinic config, audit log, payment verification). */
export async function requireSuperAdmin(req: NextRequest): Promise<
  { ok: true; userId: string; role: UserRole } | { ok: false; response: NextResponse }
> {
  const result = await requireUser(req, ["SUPER_ADMIN"]);
  if (!result.ok) return result;
  return { ok: true, userId: result.userId, role: result.role };
}

export const ADMIN_COOKIE = COOKIE_NAME;
