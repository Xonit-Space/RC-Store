import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)))
  const search = searchParams.get("search") ?? ""
  const categoryId = searchParams.get("categoryId") ?? ""

  const skip = (page - 1) * limit

  const where: Prisma.ProductWhereInput = {
    deletedAt: null, // Only fetch non-deleted
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        images: {
          orderBy: { sortOrder: "asc" as const },
          take: 1,
          select: { id: true, url: true, alt: true, isFeatured: true }
        },
        variants: {
          include: {
            inventory: true
          }
        }
      }
    })
  ])

  return NextResponse.json({
    success: true,
    data: {
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    }
  })
}, { requireAdmin: true, rateLimitNamespace: "admin_products_get" })
