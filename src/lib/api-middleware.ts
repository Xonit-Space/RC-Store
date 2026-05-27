import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "./security/rate-limit"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { logger } from "./logger"

export interface ApiHandlerConfig {
  requireAuth?: boolean
  requireAdmin?: boolean
  rateLimitNamespace?: string
  rateLimit?: { limit: number; windowMs: number }
}

export type NextApiHandler = (req: NextRequest, context: any) => Promise<NextResponse> | NextResponse

/**
 * Standard API Wrapper for all backend endpoints.
 * Provides unified Error Catching, Telemetry, Auth, and Rate Limiting.
 */
export function withApiHandler(handler: NextApiHandler, config: ApiHandlerConfig = {}) {
  return async (req: NextRequest, context: any): Promise<NextResponse> => {
    const traceId = crypto.randomUUID()
    const startTime = Date.now()

    try {
      // 1. Rate Limiting (Phase 6.1)
      const limitResponse = await checkRateLimit(
        req, 
        config.rateLimitNamespace || "global", 
        config.rateLimit
      )
      if (limitResponse) return limitResponse

      // 2. Authentication Checks
      if (config.requireAuth || config.requireAdmin) {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        if (config.requireAdmin && session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
          return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
        }
        // Inject user into headers or context if needed, but Next-Auth getServerSession handles it nicely.
      }

      // 3. Execution
      const response = await handler(req, context)

      // 4. Telemetry
      const duration = Date.now() - startTime
      response.headers.set("X-Trace-Id", traceId)
      response.headers.set("X-Response-Time", `${duration}ms`)

      logger.info({
        message: `API execution successful: ${req.method} ${req.nextUrl.pathname}`,
        traceId,
        context: {
          method: req.method,
          pathname: req.nextUrl.pathname,
          durationMs: duration,
        },
      })

      return response

    } catch (error: any) {
      logger.error({
        message: `API execution error: ${req.method} ${req.nextUrl.pathname}`,
        traceId,
        error,
        context: {
          method: req.method,
          pathname: req.nextUrl.pathname,
        },
      })

      return NextResponse.json(
        { 
          error: "Internal Server Error",
          message: process.env.NODE_ENV === "development" ? error.message : undefined,
          traceId 
        }, 
        { status: 500 }
      )
    }
  }
}
