import { trace, type Span } from "@opentelemetry/api"
import { PostHog } from "posthog-node"
import { db } from "@/lib/db"

const posthogProjectKey = process.env.POSTGRES_API_KEY || process.env.POSTHOG_API_KEY
const posthogHost = process.env.POSTHOG_HOST || "https://app.posthog.com"

let posthogClient: PostHog | null = null

// Initialize PostHog if project API token is defined
if (posthogProjectKey) {
  posthogClient = new PostHog(posthogProjectKey, { host: posthogHost })
}

export type EventType =
  | "PRODUCT_IMPRESSION"
  | "PRODUCT_CLICK"
  | "CART_ADDITION"
  | "CHECKOUT_INITIATED"
  | "ORDER_COMPLETED"
  | "CAMPAIGN_CLICK"

export interface EventData {
  userId?: string
  productId?: string
  orderId?: string
  campaignId?: string
  metadata?: Record<string, any>
}

/**
 * Global Commerce Event Tracker:
 * Channels events to PostHog and persists them to the local PostgreSQL database
 * to populate recommendation scoring pipelines.
 */
export async function trackEvent(eventType: EventType, data: EventData) {
  const { userId, productId, orderId, campaignId, metadata = {} } = data
  const now = new Date()

  // 1. Log event locally in DB to populate ML affinity tables
  try {
    if (productId && (eventType === "PRODUCT_CLICK" || eventType === "ORDER_COMPLETED")) {
      await db.recommendationEvent.create({
        data: {
          userId,
          productId,
          algoType: eventType === "ORDER_COMPLETED" ? "PURCHASE" : "CLICK",
          event: eventType,
        },
      })
    }
  } catch (dbError) {
    console.error("Failed to write local recommendation event:", dbError)
  }

  // 2. Push event payload to PostHog Node SDK
  if (posthogClient) {
    posthogClient.capture({
      distinctId: userId || "guest_anonymous_session",
      event: eventType,
      properties: {
        productId,
        orderId,
        campaignId,
        timestamp: now,
        ...metadata,
      },
    })
  }

  // 3. Output structured log to console (Datadog/CloudWatch aggregation ready)
  logInfo("COMMERCE_EVENT", {
    eventType,
    userId,
    productId,
    orderId,
    timestamp: now.toISOString(),
  })
}

// ==========================================
// STRUCTURED LOGGERS & ALERTS LOGS
// ==========================================

export function logInfo(message: string, context?: Record<string, any>) {
  console.log(
    JSON.stringify({
      level: "INFO",
      timestamp: new Date().toISOString(),
      message,
      context,
    })
  )
}

export function logWarn(message: string, context?: Record<string, any>) {
  console.warn(
    JSON.stringify({
      level: "WARN",
      timestamp: new Date().toISOString(),
      message,
      context,
    })
  )
}

export function logError(message: string, error?: any, context?: Record<string, any>) {
  console.error(
    JSON.stringify({
      level: "ERROR",
      timestamp: new Date().toISOString(),
      message,
      errorMessage: error?.message || String(error),
      errorStack: error?.stack,
      context,
    })
  )
}

// ==========================================
// OPENTELEMETRY TRACING WRAPPER
// ==========================================

const tracerName = "neoshop-ultra-backend"

export async function traceRequest<T>(
  spanName: string,
  operation: (span: Span) => Promise<T>
): Promise<T> {
  const tracer = trace.getTracer(tracerName)

  return tracer.startActiveSpan(spanName, async (span) => {
    try {
      const result = await operation(span)
      span.setStatus({ code: 1 }) // 1 = OK status
      return result
    } catch (err: any) {
      span.recordException(err)
      span.setStatus({ code: 2, message: err.message }) // 2 = ERROR status
      throw err
    } finally {
      span.end()
    }
  })
}
