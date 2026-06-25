import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { productId: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const product = await db.product.findUnique({
      where: { id: params.productId },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        variants: {
          include: {
            inventory: true
          }
        },
        images: true
      }
    })

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error: any) {
    console.error("Admin product fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request, { params }: { params: { productId: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, slug, description, price, categoryId, brandId, gender, isActive } = body

    const product = await db.product.update({
      where: { id: params.productId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(price && { price }),
        ...(categoryId && { categoryId }),
        ...(brandId !== undefined && { brandId }),
        ...(gender && { gender }),
        ...(isActive !== undefined && { isActive }),
      }
    })

    return NextResponse.json({ success: true, data: product })
  } catch (error: any) {
    console.error("Admin product update error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { productId: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Soft delete
    const product = await db.product.update({
      where: { id: params.productId },
      data: { deletedAt: new Date(), isActive: false }
    })

    return NextResponse.json({ success: true, data: product })
  } catch (error: any) {
    console.error("Admin product delete error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
