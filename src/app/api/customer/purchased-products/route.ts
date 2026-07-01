export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // OrderItem → variant → product  (no direct product relation on OrderItem)
    const orderItems = await db.orderItem.findMany({
      where: {
        order: { userId: session.user.id },
        variantId: { not: null }, // Only items with a variant (i.e. actual products)
      },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: { select: { url: true }, take: 1, orderBy: { id: "asc" } },
              },
            },
          },
        },
      },
    })

    // Deduplicate by productId (one review card per product, not per variant)
    const seenProductIds = new Set<string>()
    const uniqueProducts: {
      id: string
      name: string
      slug: string
      images: string[]
      price: number
      existingReview: any
    }[] = []

    for (const item of orderItems) {
      const product = item.variant?.product
      if (!product || seenProductIds.has(product.id)) continue
      seenProductIds.add(product.id)
      uniqueProducts.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        images: product.images.map((img: { url: string }) => img.url), // flatten to string[]
        existingReview: null,
      })
    }

    // Fetch existing reviews by this user and merge
    if (uniqueProducts.length > 0) {
      const reviews = await db.review.findMany({
        where: {
          userId: session.user.id,
          productId: { in: uniqueProducts.map((p) => p.id) },
        },
        select: {
          id: true,
          productId: true,
          rating: true,
          comment: true,
          isApproved: true,
          createdAt: true,
        },
      })

      const reviewMap = new Map(reviews.map((r) => [r.productId, r]))
      for (const product of uniqueProducts) {
        product.existingReview = reviewMap.get(product.id) || null
      }
    }

    return NextResponse.json({ success: true, products: uniqueProducts })
  } catch (error) {
    console.error("Purchased Products GET Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch purchased products" }, { status: 500 })
  }
}
