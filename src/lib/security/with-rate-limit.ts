import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, RateLimitOptions } from "./rate-limit"

/**
 * Higher-Order Function to wrap Next.js App Router API handlers with Redis rate limiting.
 * Useful since ioredis cannot be run directly in Edge Middleware.
 */
export function withRateLimit(
  handler: (req: NextRequest, context: any) => Promise<NextResponse> | NextResponse,
  namespace: string = "api",
  options?: Partial<RateLimitOptions>
) {
  return async (req: NextRequest, context: any) => {
    // 1. Check Rate Limit
    const limitResponse = await checkRateLimit(req, namespace, options)
    if (limitResponse) {
      return limitResponse // Returns 429 Too Many Requests
    }

    // 2. Proceed to actual handler
    return handler(req, context)
  }
}
