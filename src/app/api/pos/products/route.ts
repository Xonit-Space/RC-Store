import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"

export const dynamic = "force-dynamic"

interface PosProductItem {
  id: string
  name: string
  price: number
  image: string
  barcode: string
}

export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(500, parseInt(searchParams.get("limit") || "100", 10))
  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      skip,
      take: limit,
      include: {
        variants: {
          where: { isActive: true },
          include: {
            inventory: true
          }
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1
        }
      }
    }),
    db.product.count({ where: { isActive: true } })
  ])

  const posProducts: PosProductItem[] = products.flatMap((p) => {
    const imageUrl = p.images[0]?.url || ""
    
    // If there are no variants, return the product itself as a flat item
    if (!p.variants || p.variants.length === 0) {
      return [{
        id: p.id,
        name: p.name,
        price: p.price,
        image: imageUrl,
        barcode: p.slug
      }]
    }

    // Return all variants mapped to scan-able flat items
    return p.variants.map((v) => {
      const optionString = `${v.colorName || v.color} - ${v.size}`
      return {
        id: v.id,
        name: `${p.name} (${optionString})`,
        price: v.price || p.price,
        image: imageUrl,
        barcode: v.sku
      }
    })
  })

  return NextResponse.json({
    items: posProducts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  })
}, { requireAdmin: true, rateLimitNamespace: "pos_products", rateLimit: { limit: 120, windowMs: 60000 } })
