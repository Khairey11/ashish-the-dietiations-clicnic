import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthUrl,
  getGoogleOAuthConfig,
  isGoogleOAuthEnabled,
  OAUTH_COOKIE,
  OAUTH_COOKIE_OPTIONS,
  pkceChallenge,
  randomToken,
} from "@/lib/google-oauth";

/**
 * GET /api/auth/google
 * Begins the Google OAuth 2.0 (Authorization Code + PKCE) flow.
 *
 * Query params:
 *   next  — path to redirect to after a successful login (defaults to /dashboard)
 *
 * Sets short-lived httpOnly cookies holding the PKCE verifier + state so the
 * callback can verify the response. Then 302s to Google's consent screen.
 */
export async function GET(req: NextRequest) {
  if (!isGoogleOAuthEnabled()) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Google login is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and NEXT_PUBLIC_APP_URL.",
      },
      { status: 503 }
    );
  }

  const config = getGoogleOAuthConfig()!;
  const next = req.nextUrl.searchParams.get("next") || "/dashboard";
  // Sanitize: only allow relative paths to prevent open-redirect.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const state = await randomToken(24);
  const verifier = await randomToken(48);
  const challenge = await pkceChallenge(verifier);

  const authUrl = buildAuthUrl({ config, state, codeChallenge: challenge, next: safeNext });

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(OAUTH_COOKIE.state, state, OAUTH_COOKIE_OPTIONS);
  res.cookies.set(OAUTH_COOKIE.verifier, verifier, OAUTH_COOKIE_OPTIONS);
  res.cookies.set(OAUTH_COOKIE.next, safeNext, OAUTH_COOKIE_OPTIONS);
  return res;
}
