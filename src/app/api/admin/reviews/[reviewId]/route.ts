import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: { reviewId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { isApproved } = await req.json()

    const review = await db.review.update({
      where: { id: params.reviewId },
      data: { isApproved },
    })

    return NextResponse.json({ success: true, data: review })
  } catch (error) {
    console.error("Admin Review PATCH Error:", error)
    return NextResponse.json({ success: false, error: "Failed to update review" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { reviewId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await db.review.delete({
      where: { id: params.reviewId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin Review DELETE Error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete review" }, { status: 500 })
  }
}
