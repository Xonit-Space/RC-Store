import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const response = NextResponse.next();

    // Implement strict security headers
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: http:; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://js.stripe.com;"
    );
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

    if (path.startsWith("/api/admin") && (!token || (role !== "ADMIN" && role !== "SUPER_ADMIN"))) {
      return new NextResponse("Unauthorized", { status: 401 });
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/api/admin/:path*",
  ],
};
