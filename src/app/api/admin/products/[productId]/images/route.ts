import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

const isAdmin = (role?: string) => role === "ADMIN" || role === "SUPER_ADMIN"

/**
 * GET /api/admin/products/[productId]/images
 * Returns all images for a product
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const images = await db.productImage.findMany({
    where: { productId: params.productId },
    orderBy: { sortOrder: "asc" },
  })

  return NextResponse.json({ success: true, data: images })
}

/**
 * POST /api/admin/products/[productId]/images
 * Body: { url: string, alt?: string, isFeatured?: boolean, sortOrder?: number }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { url, alt, isFeatured = false, sortOrder = 0 } = body

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 })
    }

    const image = await db.productImage.create({
      data: {
        productId: params.productId,
        url,
        alt: alt || "",
        isFeatured,
        sortOrder,
      },
    })

    return NextResponse.json({ success: true, data: image })
  } catch (error: any) {
    console.error("Product image save error:", error)
    return NextResponse.json({ success: false, error: "Failed to save image" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/products/[productId]/images
 * Body: { imageId: string }
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { imageId } = body

    if (!imageId) {
      return NextResponse.json({ success: false, error: "imageId is required" }, { status: 400 })
    }

    await db.productImage.delete({
      where: { id: imageId, productId: params.productId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Product image delete error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete image" }, { status: 500 })
  }
}
