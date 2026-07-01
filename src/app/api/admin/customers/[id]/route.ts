export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  req: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ success: false, error: "Customer ID is required" }, { status: 400 })
    }

    const { isActive } = await req.json()

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser,
        status: updatedUser.isActive ? "ACTIVE" : "INACTIVE"
      }
    })

  } catch (error: any) {
    console.error("Update customer status error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update customer status" },
      { status: 500 }
    )
  }
}
