import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Both current and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: "New password must be at least 8 characters" }, { status: 400 })
    }

    // Fetch the user's current hashed password
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    })

    if (!user?.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Password change is not available for accounts using social login" },
        { status: 400 }
      )
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash and save new password
    const hashed = await bcrypt.hash(newPassword, 12)
    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: hashed },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ success: false, error: "Failed to change password" }, { status: 500 })
  }
}
