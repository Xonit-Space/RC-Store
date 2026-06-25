import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Missing verification token" }, { status: 400 })
  }

  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    if (verificationToken.expires < new Date()) {
      await db.verificationToken.delete({ where: { token } })
      return NextResponse.json({ error: "Token has expired" }, { status: 400 })
    }

    // Mark user as verified
    await db.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() }
    })

    // Cleanup token
    await db.verificationToken.delete({ where: { token } })

    // Redirect to login with success flag
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
    return NextResponse.redirect(`${baseUrl}/login?verified=true`)
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
