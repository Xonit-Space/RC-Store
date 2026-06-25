import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { buildContentSecurityPolicy, generateCspNonce } from "@/lib/security/csp";

export default withAuth(
  function middleware(req) {
    const nonce = generateCspNonce();
    const cspHeader = buildContentSecurityPolicy(nonce);

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", cspHeader);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.headers.set("Content-Security-Policy", cspHeader);
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("Cross-Origin-Resource-Policy", "same-site");

    const token = req.nextauth.token;
    const role = token?.role;
    const path = req.nextUrl.pathname;

    const isAdminPath = path.startsWith("/admin") || path.startsWith("/api/admin");
    const isAuthorizedAdmin = token && (role === "ADMIN" || role === "SUPER_ADMIN");

    if (isAdminPath && !isAuthorizedAdmin) {
      if (path.startsWith("/api/")) {
        return new NextResponse("Unauthorized", { status: 401 });
      } else {
        // Redirect non-admins trying to access admin UI to the home page or login
        const redirectUrl = new URL("/login", req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return response;
  },
  {
    callbacks: {
      authorized: () => true, // We handle auth logic in the middleware function above
    },
  }
);

export const config = {
  matcher: [
    /*
     * Skip Next.js internals, static assets, and NextAuth API routes.
     * Running withAuth on /api/auth/* causes 500s on Vercel.
     */
    "/((?!_next/static|_next/image|favicon.ico|sw.js|api/auth).*)",
  ],
};
