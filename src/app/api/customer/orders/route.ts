import { NextRequest, NextResponse } from "next/server"
import { withApiHandler, ApiHandlerContext } from "@/lib/api-middleware"
import { getOrdersByUserId } from "@/repositories/order"

export const dynamic = "force-dynamic"

export const GET = withApiHandler(async (_req: NextRequest, context: ApiHandlerContext) => {
  // Session is pre-resolved by withApiHandler \u2014 no second getServerSession() call needed
  const session = context.session!
  const orders = await getOrdersByUserId(session.user.id)
  return NextResponse.json({ success: true, data: orders })
}, { requireAuth: true, rateLimitNamespace: "api_customer_orders", rateLimit: { limit: 50, windowMs: 60000 } })
