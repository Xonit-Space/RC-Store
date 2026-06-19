import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { getProductBySlug } from "@/lib/api-server"

export const GET = withApiHandler(async (req: NextRequest, context: any) => {
  const resolvedParams = await context.params
  const slug = resolvedParams?.slug
  if (!slug) {
    return NextResponse.json({ error: "Missing product slug parameter" }, { status: 400 })
  }

  const product = await getProductBySlug(slug)
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json(product)
}, { rateLimitNamespace: "api_product_slug", rateLimit: { limit: 120, windowMs: 60000 } })
