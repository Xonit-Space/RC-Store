import { NextRequest, NextResponse } from "next/server"
import { rateLimit } from "./rate-limit"

export function withRateLimit(
  handler: (req: NextRequest, context: any) => Promise<NextResponse> | NextResponse,
  namespace: string = "api",
  options?: any
) {
  return async (req: NextRequest, context: any) => {
    // 1. Check Rate Limit
    const limitResponse = await rateLimit(req.ip || namespace, 100, 60000)
    if (!limitResponse.success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 })
    }

    // 2. Proceed to actual handler
    return handler(req, context)
  }
}
