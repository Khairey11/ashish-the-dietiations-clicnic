import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";

/**
 * Authentication using an HMAC-signed session cookie.
 *
 * Login flow:
 *   1. POST /api/admin/login (or /api/auth/register) with { email, password }
 *   2. Server verifies password against User.passwordHash (scrypt)
 *   3. Server sets httpOnly cookie `admin_session` = `<userId>.<hmac>`
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
