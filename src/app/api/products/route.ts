import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * GET /api/products
 * Paginated, filtered product catalog endpoint
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get("page") || "1")
  const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 100)
  const category = searchParams.get("category")
  const categoryId = searchParams.get("categoryId")
  const brand = searchParams.get("brand")
  const q = searchParams.get("q")
  const featured = searchParams.get("featured") === "true"
  const minPrice = parseFloat(searchParams.get("minPrice") || "0")
  const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999")

  const where: any = {
    isActive: true,
    price: { gte: minPrice, lte: maxPrice },
  }
  if (category) where.category = { slug: category }
  if (categoryId) where.categoryId = categoryId
  if (brand) where.brand = { slug: brand }
  if (featured) where.isFeatured = true
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ]
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        variants: { select: { id: true, size: true, color: true, price: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.product.count({ where }),
  ])

  // Normalize images include query parameter behavior to support both formats
  const formattedProducts = products.map((p) => {
    // If the image query failed or is missing, fallback to empty array
    const imgs = p.images || []
    return {
      ...p,
      images: imgs,
    }
  })

  return NextResponse.json({
    products: formattedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}, { rateLimitNamespace: "api_products", rateLimit: { limit: 200, windowMs: 60000 } })
