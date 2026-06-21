import { queueConnection } from "../queue/connection"
import { NextResponse } from "next/server"
import { generateClientFingerprint } from "./fingerprint"

export interface RateLimitOptions {
  limit: number
  windowMs: number
  errorMessage?: string
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  limit: 100,
  windowMs: 60 * 1000,
  errorMessage: "Too many requests, please try again later."
}

/**
 * Validates a request against a Redis-backed fixed window rate limiter.
 * Returns null if allowed, or a NextResponse with 429 status if blocked.
 */
export async function checkRateLimit(
  req: Request,
  namespace: string = "global",
  options: Partial<RateLimitOptions> = {}
): Promise<NextResponse | null> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Fail-safe: if running in production but no real Redis is configured, bypass rate limits to avoid hanging
  if (process.env.NODE_ENV === "production" && (!process.env.REDIS_URL || process.env.REDIS_URL.includes("localhost") || process.env.REDIS_URL.includes("127.0.0.1"))) {
    return null
  }

  // Use fingerprinting (IP + UserAgent) to identify the caller securely
  const fingerprint = generateClientFingerprint(req as any)
  const key = `ratelimit:${namespace}:${fingerprint}`

  try {
    const current = await queueConnection.incr(key)
    
    if (current === 1) {
      // Set expiry on first increment
      await queueConnection.pexpire(key, opts.windowMs)
    }

    if (current > opts.limit) {
      console.warn(`[RateLimit] Blocked request for ${fingerprint} in namespace ${namespace}`)
      return NextResponse.json(
        { error: opts.errorMessage },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil(opts.windowMs / 1000).toString(),
            "X-RateLimit-Limit": opts.limit.toString(),
            "X-RateLimit-Remaining": "0"
          }
        }
      )
    }

    return null // Allowed
  } catch (error) {
    console.error("[RateLimit] Error checking rate limit:", error)
    // Fail open in case of Redis failure to prevent complete outage
    return null
  }
}
