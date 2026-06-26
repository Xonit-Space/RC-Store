import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"

export const dynamic = "force-dynamic"

export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const page   = Math.max(1, parseInt(searchParams.get("page")  || "1", 10))
  const limit  = Math.min(50, parseInt(searchParams.get("limit") || "20", 10))
  const search = searchParams.get("search") || ""
  const skip   = (page - 1) * limit

  // Phase 9: Build search filter
  const where = search ? {
    OR: [
      { orderNumber: { contains: search, mode: "insensitive" as const } },
      { user: { name: { contains: search, mode: "insensitive" as const } } },
      { user: { email: { contains: search, mode: "insensitive" as const } } },
    ]
  } : {}

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
        shippingAddress: true,
        billingAddress: true,
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true, images: true } } }
            }
          }
        },
      },
      orderBy: { createdAt: "desc" }
    }),
    db.order.count({ where })
  ])

  return NextResponse.json({
    success: true,
    data: orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  })
}, { requireAdmin: true, rateLimitNamespace: "admin_orders_list" })
