import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

/**
 * Next.js middleware — protects /admin and /dashboard pages and /api/admin/* routes.
 *
 * Public site, /api/payments/*, /login, and static assets are NOT affected.
 *
 * Note: this file MUST be named `middleware.ts` (not `proxy.ts`) and live at the
 * `src/` root for Next.js to recognise and invoke it.
 */

const PROTECTED_PAGES = ["/admin", "/dashboard"];
const PROTECTED_API = "/api/admin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin API routes (except /api/admin/login which is the auth endpoint).
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

  // Protect admin / dashboard pages (server-side redirect to /login).
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
  matcher: ["/admin/:path*", "/dashboard/:path*", "/api/admin/:path*"],
};
