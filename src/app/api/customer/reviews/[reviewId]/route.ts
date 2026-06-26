import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(req: NextRequest, { params }: { params: { reviewId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const review = await db.review.findUnique({
      where: { id: params.reviewId }
    })

    if (!review || review.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Not found or unauthorized" }, { status: 404 })
    }

    await db.review.delete({
      where: { id: params.reviewId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Customer Review DELETE Error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete review" }, { status: 500 })
  }
}
