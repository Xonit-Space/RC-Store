import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { db } from "@/lib/db"

// API responses cached 60 seconds on Vercel CDN \u2014 products don't change per-second
export const revalidate = 60

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
    // Phase 4: Full-Text Search (FTS) using PostgreSQL
    const searchQuery = q.split(/\s+/).filter(Boolean).join(" | ")
    where.OR = [
      { name: { search: searchQuery } },
      { description: { search: searchQuery } },
    ]
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        createdAt: true,
        images: {
          orderBy: { sortOrder: "asc" },
          select: { url: true }
        },
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        variants: {
          where: { isActive: true },
          select: { id: true, size: true, color: true, price: true }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: "desc" },
    }),
    db.product.count({ where }),
  ])

  // Format to standard product object signature
  const formattedProducts = products.map((p) => {
    return {
      ...p,
      images: p.images || [],
      reviewCount: p._count.reviews
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
