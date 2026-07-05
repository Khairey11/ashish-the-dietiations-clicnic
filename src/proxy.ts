import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

/**
 * Protects /admin and /dashboard pages and /api/admin/* routes.
 * Public site, /api/payments/*, /login, and static assets are not affected.
 */

const PROTECTED_PAGES = ["/admin", "/dashboard"];
const PROTECTED_API = "/api/admin";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin API routes
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

  // Protect admin / dashboard pages (server-side render, redirect to login)
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
