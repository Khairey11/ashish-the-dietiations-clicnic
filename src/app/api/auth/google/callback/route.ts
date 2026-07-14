import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession, ADMIN_COOKIE } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";
import {
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  getGoogleOAuthConfig,
  OAUTH_COOKIE,
  OAUTH_COOKIE_OPTIONS,
  safeEqual,
} from "@/lib/google-oauth";

/**
 * GET /api/auth/google/callback
 * Google redirects here with ?code=...&state=...
 *
 * Steps:
 *   1. Verify state matches the cookie we set.
 *   2. Exchange code + PKCE verifier for tokens.
 *   3. Fetch user info from Google.
 *   4. Upsert the User (CLIENT role) + Account (provider="google").
 *      - If the email already exists with a password, link the Google account
 *        to that user (no password reset required).
 *   5. Set the HMAC session cookie and redirect to `next` (default /dashboard,
 *      or /dashboard/onboarding for newly-created accounts).
 */

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days, matches /api/admin/login
};

export async function GET(req: NextRequest) {
  const config = getGoogleOAuthConfig();
  if (!config) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", req.url));
  }

  const code = req.nextUrl.searchParams.get("code");
  const incomingState = req.nextUrl.searchParams.get("state");
  const storedState = req.cookies.get(OAUTH_COOKIE.state)?.value;
  const verifier = req.cookies.get(OAUTH_COOKIE.verifier)?.value;
  const nextRaw = req.cookies.get(OAUTH_COOKIE.next)?.value || "/dashboard";
  // Re-sanitize (defense in depth — cookie could have been tampered with).
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/dashboard";

  // ---------- Validate the OAuth response ----------
  if (!code || !incomingState || !storedState || !verifier) {
    return redirectToLogin(req, "missing_parameters");
  }
  const stateOk = await safeEqual(incomingState, storedState);
  if (!stateOk) {
    return redirectToLogin(req, "state_mismatch");
  }

  try {
    // ---------- Exchange code for tokens ----------
    const tokens = await exchangeCodeForTokens({ config, code, codeVerifier: verifier });
    if (!tokens.access_token) {
      return redirectToLogin(req, "no_access_token");
    }

    // ---------- Fetch Google userinfo ----------
    const info = await fetchGoogleUserInfo(tokens.access_token);
    if (!info.email) {
      return redirectToLogin(req, "no_email");
    }
    // Google may not always send email_verified, but if it does and it's false,
    // refuse — we don't want an unverified email to bind to an account.
    if (info.email_verified === false) {
      return redirectToLogin(req, "email_not_verified");
    }

    const email = info.email.toLowerCase();

    // ---------- Upsert User + Account (transactional) ----------
    const result = await db.$transaction(async (tx) => {
      // 1) Is there already a Google Account for this providerAccountId?
      const existingAccount = await tx.account.findUnique({
        where: {
          provider_providerAccountId: { provider: "google", providerAccountId: info.sub },
        },
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, isActive: true, role: true } },
        },
      });

      let userId: string;
      let isNewUser = false;

      if (existingAccount) {
        if (!existingAccount.user.isActive) {
          throw new Error("account_disabled");
        }
        userId = existingAccount.userId;
      } else {
        // 2) Otherwise, look up by email — link existing user if found.
        const existingUser = await tx.user.findUnique({
          where: { email },
          select: { id: true, isActive: true, role: true },
        });

        if (existingUser) {
          if (!existingUser.isActive) {
            throw new Error("account_disabled");
          }
          userId = existingUser.id;
        } else {
          // 3) Create a new CLIENT user + empty patient profile.
          const created = await tx.user.create({
            data: {
              email,
              name: info.name || info.given_name || email.split("@")[0],
              avatarUrl: info.picture || null,
              role: "CLIENT",
              isActive: true,
              emailVerified: new Date(),
              patient: {
                create: {
                  primaryGoal: "",
                  condition: "",
                  onboardingCompleted: false,
                },
              },
            },
            select: { id: true },
          });
          userId = created.id;
          isNewUser = true;
        }

        // 4) Link the Google Account to this user.
        await tx.account.create({
          data: {
            userId,
            type: "oauth",
            provider: "google",
            providerAccountId: info.sub,
            refresh_token: tokens.refresh_token || null,
            access_token: tokens.access_token || null,
            expires_at: tokens.expires_in
              ? Math.floor(Date.now() / 1000) + tokens.expires_in
              : null,
            token_type: tokens.token_type || null,
            scope: tokens.scope || null,
            id_token: tokens.id_token || null,
          },
        });
      }

      // 5) Update avatar / name if Google has fresher data.
      if (info.picture || info.name) {
        await tx.user.update({
          where: { id: userId },
          data: {
            avatarUrl: info.picture || undefined,
            name: info.name || undefined,
            lastLoginAt: new Date(),
            emailVerified: info.email_verified ? new Date() : undefined,
          },
        });
      } else {
        await tx.user.update({
          where: { id: userId },
          data: { lastLoginAt: new Date() },
        });
      }

      return { userId, isNewUser };
    });

    // ---------- Issue session + audit ----------
    const sessionToken = await signSession(result.userId);
    await writeAuditLog({
      userId: result.userId,
      action: "GOOGLE_LOGIN",
      entity: "User",
      entityId: result.userId,
      after: { provider: "google", isNewUser: result.isNewUser },
      ipAddress: getClientIp(req),
    }); // audit failure is swallowed inside writeAuditLog

    // First-time users go to onboarding so they finish their profile.
    const dest = result.isNewUser ? "/dashboard/onboarding" : next;

    const res = NextResponse.redirect(new URL(dest, req.url));
    res.cookies.set(ADMIN_COOKIE, sessionToken, SESSION_COOKIE_OPTIONS);
    // Clear the short-lived OAuth cookies.
    res.cookies.set(OAUTH_COOKIE.state, "", { ...OAUTH_COOKIE_OPTIONS, maxAge: 0 });
    res.cookies.set(OAUTH_COOKIE.verifier, "", { ...OAUTH_COOKIE_OPTIONS, maxAge: 0 });
    res.cookies.set(OAUTH_COOKIE.next, "", { ...OAUTH_COOKIE_OPTIONS, maxAge: 0 });
    return res;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    const message = err instanceof Error ? err.message : "unknown_error";
    return redirectToLogin(req, message);
  }
}

function redirectToLogin(req: NextRequest, reason: string) {
  const url = new URL("/login", req.url);
  url.searchParams.set("error", "google_auth_failed");
  url.searchParams.set("reason", reason);
  const res = NextResponse.redirect(url);
  res.cookies.set(OAUTH_COOKIE.state, "", { ...OAUTH_COOKIE_OPTIONS, maxAge: 0 });
  res.cookies.set(OAUTH_COOKIE.verifier, "", { ...OAUTH_COOKIE_OPTIONS, maxAge: 0 });
  res.cookies.set(OAUTH_COOKIE.next, "", { ...OAUTH_COOKIE_OPTIONS, maxAge: 0 });
  return res;
}
