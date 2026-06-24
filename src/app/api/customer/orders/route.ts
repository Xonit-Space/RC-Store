import { NextRequest, NextResponse } from "next/server"
import { withApiHandler, ApiHandlerContext } from "@/lib/api-middleware"
import { getOrdersByUserId } from "@/repositories/order"

export const dynamic = "force-dynamic"

export const GET = withApiHandler(async (req: NextRequest, context: ApiHandlerContext) => {
  // Session is pre-resolved by withApiHandler — no second getServerSession() call needed
  const session = context.session!
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))
  const data = await getOrdersByUserId(session.user.id, page, limit)
  return NextResponse.json({ success: true, ...data })
}, { requireAuth: true, rateLimitNamespace: "api_customer_orders", rateLimit: { limit: 50, windowMs: 60000 } })
