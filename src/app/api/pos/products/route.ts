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
  const products = await db.product.findMany({
    where: { isActive: true },
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
  })

  const posProducts: PosProductItem[] = products.flatMap((p: any) => {
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
    return p.variants.map((v: any) => {
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

  return NextResponse.json(posProducts)
}, { requireAdmin: true, rateLimitNamespace: "pos_products", rateLimit: { limit: 120, windowMs: 60000 } })
