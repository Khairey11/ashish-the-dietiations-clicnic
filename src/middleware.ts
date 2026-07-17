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
 * Resolve the app's own origin (scheme + host). Falls back to the request's
 * own host header if APP_BASE_URL is not configured.
 */
function getExpectedOrigin(req: NextRequest): string {
  const configured = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    try {
      const u = new URL(configured);
      return u.origin;
    } catch {
      // fall through
    }
  }
  // Fallback: trust the Host header on the incoming request.
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  return host ? `${proto}://${host}` : "";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ----- CSRF protection on mutation routes -----
  if (pathname.startsWith("/api/") && MUTATION_METHODS.has(req.method)) {
    const origin = req.headers.get("origin");
    const expected = getExpectedOrigin(req);
    // In dev with no APP_BASE_URL, skip the check (don't lock out the developer).
    if (expected && origin && origin !== expected) {
      return NextResponse.json(
        { success: false, error: "Cross-origin requests are not allowed." },
        { status: 403 }
      );
    }
    // If `origin` is missing on a mutation request, that's suspicious —
    // browsers always send it. Allow it through only in dev (where curl / Postman
    // are common). In production, reject.
    if (!origin && process.env.NODE_ENV === "production" && expected) {
      return NextResponse.json(
        { success: false, error: "Missing Origin header." },
        { status: 403 }
      );
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
