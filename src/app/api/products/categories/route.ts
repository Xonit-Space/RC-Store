import { NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export const GET = withApiHandler(async () => {
  const categories = await db.category.findMany({
    include: {
      children: {
        include: { children: true },
      },
      _count: {
        select: { products: true },
      },
    },
  })
  return NextResponse.json(categories)
}, { rateLimitNamespace: "api_categories", rateLimit: { limit: 100, windowMs: 60000 } })
