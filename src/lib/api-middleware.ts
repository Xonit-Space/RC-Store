import { NextRequest, NextResponse } from "next/server"
import { rateLimit } from "./security/rate-limit"
import { getServerSession, Session } from "next-auth"
import { authOptions } from "./auth"
import { logger } from "./logger"

export interface ApiHandlerConfig {
  requireAuth?: boolean
  requireAdmin?: boolean
  rateLimitNamespace?: string
  rateLimit?: { limit: number; windowMs: number }
}

/**
 * Extended context passed to every handler \u2014 includes the pre-resolved session
 * so handlers never need to call getServerSession() a second time.
 */
export interface ApiHandlerContext {
  /** Resolved Next.js route context (params, etc.) */
  params?: Record<string, string>
  /** Pre-resolved session from withApiHandler \u2014 avoids double JWT decode */
  session?: Session | null
}

export type NextApiHandler = (req: NextRequest, context: ApiHandlerContext) => Promise<NextResponse> | NextResponse

/**
 * Standard API Wrapper for all backend endpoints.
 * Provides unified Error Catching, Telemetry, Auth, and Rate Limiting.
 *
 * Optimization: getServerSession is called ONCE here and injected into context.
 * Individual handlers must NOT call getServerSession() again \u2014 use context.session.
 */
export function withApiHandler(handler: NextApiHandler, config: ApiHandlerConfig = {}) {
  return async (req: NextRequest, routeContext: any): Promise<NextResponse> => {
    const traceId = crypto.randomUUID()
    const startTime = Date.now()

    try {
      // 1. Rate Limiting
      const limitResponse = await rateLimit(
        req.ip || "global",
        config.rateLimit?.limit || 100,
        config.rateLimit?.windowMs || 60000
      )
      if (!limitResponse.success) {
        return NextResponse.json({ error: "Too Many Requests" }, { status: 429 })
      }

      // 2. Authentication \u2014 resolved ONCE, injected into context for handler reuse
      let resolvedSession: Session | null = null
      if (config.requireAuth || config.requireAdmin) {
        resolvedSession = await getServerSession(authOptions)
        if (!resolvedSession || !resolvedSession.user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        if (config.requireAdmin && resolvedSession.user.role !== "SUPER_ADMIN" && resolvedSession.user.role !== "ADMIN") {
          return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
        }
      }

      // 3. Build handler context with resolved session
      const handlerContext: ApiHandlerContext = {
        ...routeContext,
        session: resolvedSession,
      }

      // 4. Execution
      const response = await handler(req, handlerContext)

      // 5. Telemetry
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
