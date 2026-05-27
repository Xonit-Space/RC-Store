import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // 1. Admin Routes protection (/admin/... and /api/admin/...)
    if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
      const isAdmin = token?.role === UserRole.SUPER_ADMIN || token?.role === UserRole.ADMIN
      const isActive = token?.isActive !== false
      
      if (!isAdmin || !isActive) {
        console.warn(`[Security] Unauthorized admin access attempt to ${path}`)
        if (path.startsWith("/api/")) {
          return new NextResponse("Unauthorized", { status: 401 })
        }
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    // 2. Customer Routes protection (/customer/... and /api/customer/...)
    if (path.startsWith("/customer") || path.startsWith("/api/customer")) {
      const isCustomer = !!token
      if (!isCustomer) {
        if (path.startsWith("/api/")) {
          return new NextResponse("Unauthorized", { status: 401 })
        }
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    // 3. Inject Security Headers
    const response = NextResponse.next()
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://js.stripe.com;"
    )

    return response
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Configure the paths to be protected by the middleware
export const config = {
  matcher: [
    "/admin/:path*",
    "/customer/:path*",
    "/api/admin/:path*",
    "/api/customer/:path*",
  ],
}
