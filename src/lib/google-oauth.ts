/**
 * Google OAuth 2.0 helper — Authorization Code flow with PKCE.
 *
 * No external dependencies: uses Web Crypto for code_verifier / state / S256.
 *
 * Required env vars (set in .env):
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   NEXT_PUBLIC_APP_URL  (e.g. https://thedietitiansclinic.com)
 *
 * In dev, NEXT_PUBLIC_APP_URL may be http://localhost:3000.
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

// Scopes: openid email profile — enough to identify + populate a CLIENT profile.
const SCOPES = ["openid", "email", "profile"].join(" ");

/** Cookie names used to round-trip state + PKCE verifier between request and callback. */
export const OAUTH_COOKIE = {
  state: "google_oauth_state",
  verifier: "google_oauth_verifier",
  next: "google_oauth_next",
} as const;

export type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
};

export type OAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export function getGoogleOAuthConfig(): OAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");

  if (!clientId || !clientSecret || !baseUrl) {
    return null;
  }

  const redirectUri = `${baseUrl.replace(/\/$/, "")}/api/auth/google/callback`;
  return { clientId, clientSecret, redirectUri };
}

/** True when both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured. */
export function isGoogleOAuthEnabled(): boolean {
  return (
    !!process.env.GOOGLE_CLIENT_ID &&
    !!process.env.GOOGLE_CLIENT_SECRET &&
    !!process.env.NEXT_PUBLIC_APP_URL
  );
}

/* ---------------------------------- PKCE ---------------------------------- */

function base64UrlEncode(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function base64UrlDecode(input: string): Uint8Array {
  return new Uint8Array(Buffer.from(input, "base64url"));
}

/** Random URL-safe string of ~32 bytes. */
export async function randomToken(len = 32): Promise<string> {
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return base64UrlEncode(buf);
}

/** S256 PKCE code_challenge for a given code_verifier. */
export async function pkceChallenge(verifier: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

/* ----------------------------- URL construction ---------------------------- */

export function buildAuthUrl(opts: {
  config: OAuthConfig;
  state: string;
  codeChallenge: string;
  next?: string;
}): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: opts.config.clientId,
    redirect_uri: opts.config.redirectUri,
    scope: SCOPES,
    state: opts.state,
    code_challenge: opts.codeChallenge,
    code_challenge_method: "S256",
    // Force consent the first time, otherwise Google may not return a refresh_token.
    access_type: "offline",
    prompt: "consent",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/* ------------------------------ Token exchange ----------------------------- */

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
};

export async function exchangeCodeForTokens(opts: {
  config: OAuthConfig;
  code: string;
  codeVerifier: string;
}): Promise<TokenResponse> {
  const body = new URLSearchParams({
    code: opts.code,
    client_id: opts.config.clientId,
    client_secret: opts.config.clientSecret,
    redirect_uri: opts.config.redirectUri,
    grant_type: "authorization_code",
    code_verifier: opts.codeVerifier,
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${text}`);
  }
  return JSON.parse(text) as TokenResponse;
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Google userinfo fetch failed: ${res.status} ${text}`);
  }
  const info = JSON.parse(text) as GoogleUserInfo;
  if (!info.sub || !info.email) {
    throw new Error("Google did not return sub + email");
  }
  return info;
}

/* ------------------------------ Cookie helpers ----------------------------- */

export const OAUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, // lax so Google's redirect top-level navigation works
  path: "/",
  maxAge: 60 * 10, // 10 minutes is plenty for the OAuth round-trip
};

export function clearOAuthCookies(): Record<string, string> {
  return {
    [OAUTH_COOKIE.state]: "",
    [OAUTH_COOKIE.verifier]: "",
    [OAUTH_COOKIE.next]: "",
  };
}

/** Constant-time-ish string compare to mitigate timing attacks on state. */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  if (a.length !== b.length) return false;
  const aBytes = base64UrlDecode(a);
  const bBytes = base64UrlDecode(b);
  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  // If the strings are not valid base64url, fall back to char-by-char XOR.
  if (Number.isNaN(result)) {
    let r2 = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      r2 |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return r2 === 0 && a.length === b.length;
  }
  return result === 0;
}
