import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"

export const dynamic = "force-dynamic"

export const GET = withApiHandler(async (req: NextRequest) => {
  const orders = await db.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          variant: {
            include: { product: true }
          }
        }
      },
      payment: true,
      shippingAddress: true,
    },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(orders)
}, { requireAdmin: true, rateLimitNamespace: "admin_orders_list" })
