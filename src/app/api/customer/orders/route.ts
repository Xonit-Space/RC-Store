import { NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { getOrdersByUserId } from "@/repositories/order"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export const GET = withApiHandler(async () => {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const orders = await getOrdersByUserId(session.user.id)
  return NextResponse.json(orders)
}, { requireAuth: true, rateLimitNamespace: "api_customer_orders", rateLimit: { limit: 50, windowMs: 60000 } })
