import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { withApiHandler } from "@/lib/api-middleware"

export const POST = withApiHandler(async (request, session) => {
  const body = await request.json()
  const { imageUrl, caption, productId } = body

  if (!imageUrl) {
    return NextResponse.json({ success: false, error: "Image URL is required" }, { status: 400 })
  }

  const newGalleryImage = await db.galleryImage.create({
    data: {
      imageUrl,
      caption,
      productId: productId || null,
      authorName: session.user.name || session.user.email,
      isApproved: false // Requires admin approval
    }
  })

  return NextResponse.json({ success: true, data: newGalleryImage })
}, { requireAuth: true })
