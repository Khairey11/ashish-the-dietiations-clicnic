import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

/**
 * Next.js middleware — runs before every matched route.
 *
 * Responsibilities:
 *   1. CSRF protection on all /api/* mutation routes (POST/PUT/PATCH/DELETE).
 *      Browsers always send the `Origin` header for cross-origin requests; if
 *      it doesn't match our app's origin, we reject. This blocks cross-site
 *      form POSTs even when `sameSite: lax` would allow them.
 *   2. Auth guard for /admin and /dashboard pages (server-side redirect).
 *   3. Quick HMAC auth check for /api/admin/* routes (returns 401 fast if no
 *      valid session cookie). The full sessionVersion check happens in the
 *      route handler via requireAdmin/etc.
 *
 * Public site, /api/payments/*, /login, and static assets are not auth-guarded
 * (but ARE CSRF-guarded for mutations).
 */

const PROTECTED_PAGES = ["/admin", "/dashboard"];
const PROTECTED_API = "/api/admin";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Normalize an origin URL: strip trailing slash and www. prefix so that
 * "https://www.example.com" and "https://example.com" are treated as the
 * same origin. This prevents false-positive CSRF rejections when the app
 * is accessible via both www and non-www domains.
 */
function normalizeOrigin(url: string): string {
  try {
    const u = new URL(url);
    let host = u.hostname;
    // Strip leading "www." so both variants match
    if (host.startsWith("www.")) host = host.slice(4);
    return `${u.protocol}//${host}`;
  } catch {
    return url.replace(/\/$/, "").toLowerCase();
  }
}

/**
 * Resolve the app's own origin (scheme + host). Falls back to the request's
 * own host header if APP_BASE_URL is not configured.
 */
function getExpectedOrigin(req: NextRequest): string {
  const configured = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    return normalizeOrigin(configured);
  }
  // Fallback: trust the Host header on the incoming request.
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  return host ? normalizeOrigin(`${proto}://${host}`) : "";
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ----- Exempt routes with their own signature verification -----
  // Server-to-server callers (GitHub, payment gateways) don't send an Origin
  // header, so the generic CSRF check below would reject them. These routes
  // all verify authenticity themselves (HMAC / gateway signature), so skip
  // CSRF for them. This must run BEFORE the CSRF block.
  const CSRF_EXEMPT = ["/api/webhook", "/api/payments/esewa/return", "/api/payments/khalti/return"];
  const isCsrfExempt = CSRF_EXEMPT.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // ----- CSRF protection on mutation routes -----
  if (!isCsrfExempt && pathname.startsWith("/api/") && MUTATION_METHODS.has(req.method)) {
    const origin = req.headers.get("origin");
    const expected = getExpectedOrigin(req);

    // If both origin and expected are known, compare them (with www-normalization).
    if (expected && origin) {
      const normalizedOrigin = normalizeOrigin(origin);
      if (normalizedOrigin !== expected) {
        return NextResponse.json(
          { success: false, error: "Cross-origin requests are not allowed." },
          { status: 403 }
        );
      }
    }
    // If `origin` is missing on a mutation request:
    //   - In production: allow it through for auth routes (login/register/reset)
    //     since they have their own protections (rate limiting, password verification).
    //   - In production: reject for other API routes (suspicious).
    //   - In dev: always allow (curl/Postman don't send Origin).
    // Note: Browsers normally send Origin for fetch/XHR, but some edge cases
    // (HTTP→HTTPS redirects, certain older browsers) may not. Blocking auth
    // routes on missing Origin would lock users out in those cases.
    if (!origin && process.env.NODE_ENV === "production" && expected) {
      const isAuthRoute =
        pathname.startsWith("/api/admin/login") ||
        pathname.startsWith("/api/auth/");
      if (!isAuthRoute) {
        return NextResponse.json(
          { success: false, error: "Missing Origin header." },
          { status: 403 }
        );
      }
    }
  }

  // ----- Auth guard for /api/admin/* (except /api/admin/login) -----
  if (pathname.startsWith(PROTECTED_API) && !pathname.startsWith("/api/admin/login")) {
    const token = req.cookies.get("admin_session")?.value;
    const userId = await verifySession(token);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // ----- Auth guard for /admin and /dashboard pages -----
  if (PROTECTED_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const token = req.cookies.get("admin_session")?.value;
    const userId = await verifySession(token);
    if (!userId) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Match all admin/dashboard pages + all API routes (for CSRF).
  matcher: ["/admin/:path*", "/dashboard/:path*", "/api/:path*"],
};