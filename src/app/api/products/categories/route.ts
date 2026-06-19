import { NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { getCachedCategories } from "@/lib/services/product-service"

// Categories are near-static \u2014 cache for 1 hour on Vercel CDN
export const revalidate = 3600

export const GET = withApiHandler(async () => {
  // Use the shared cached service instead of a raw DB query
  const categories = await getCachedCategories()
  return NextResponse.json(categories)
}, { rateLimitNamespace: "api_categories", rateLimit: { limit: 100, windowMs: 60000 } })
