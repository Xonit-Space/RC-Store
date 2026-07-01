export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const reviews = await db.review.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: { id: true, name: true, slug: true, images: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Customer Reviews GET Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { rating, comment, productId } = await req.json()

    if (!rating || !productId) {
      return NextResponse.json({ success: false, error: "Rating and productId are required" }, { status: 400 })
    }

    // Check if review already exists
    const existing = await db.review.findUnique({
      where: {
        userId_productId: { userId: session.user.id, productId }
      }
    })

    if (existing) {
      return NextResponse.json({ success: false, error: "You have already reviewed this product" }, { status: 400 })
    }

    const review = await db.review.create({
      data: {
        rating: Number(rating),
        comment,
        productId,
        userId: session.user.id,
        isApproved: false // Requires admin approval
      }
    })

    return NextResponse.json({ success: true, data: review })
  } catch (error) {
    console.error("Customer Reviews POST Error:", error)
    return NextResponse.json({ success: false, error: "Failed to submit review" }, { status: 500 })
  }
}
