/**
 * System Bootstrap: Single entry-point that wires all backend subsystems together.
 *
 * Call `bootstrapBackendSystems()` once at application startup (e.g., in a custom server
 * or a long-lived Next.js API route) to ensure:
 *   1. Queue bridge is active (Events → BullMQ Workers)
 *   2. Notification pipeline is active (Events → Push Notifications)
 *   3. All event handlers are registered before traffic arrives
 *
 * This resolves the "powerful but fragmented" architecture gap identified in Phase 6.0.1.
 */

import { logger } from "@/lib/logger"

let bootstrapped = false

export async function bootstrapBackendSystems(): Promise<void> {
  if (bootstrapped) {
    logger.info("[Bootstrap] Systems already initialized. Skipping duplicate call.")
    return
  }

  logger.info("[Bootstrap] 🚀 Initializing RC Store backend systems...")

  try {
    const { ensureRedisReady } = await import("@/services/redis")
    const { isLongRunningNode } = await import("@/lib/runtime")
    const { setBusSubscriptionsEnabled } = await import("@/events/handlers/handler-registry")

    const redisReady = await ensureRedisReady()

    const enableBusSubscriptions = isLongRunningNode && redisReady
    setBusSubscriptionsEnabled(enableBusSubscriptions)

    if (isLongRunningNode) {
      if (!redisReady) {
        logger.info("[Bootstrap] Redis unavailable: using in-memory pub/sub fallback.")
      }
    } else {
      logger.info("[Bootstrap] Serverless runtime: event handlers will dispatch inline.")
    }

    const { initializeQueueBridge } = await import("@/events/handlers/queue-bridge")
    initializeQueueBridge()
    logger.info("[Bootstrap] ✅ Queue Bridge: Event Bus → BullMQ workers wired.")

    const { initializeNotificationPipeline } = await import("@/notifications/event-subscriber")
    initializeNotificationPipeline()
    logger.info("[Bootstrap] ✅ Notification Pipeline: Event Bus → Notification Engine wired.")

    if (isLongRunningNode && process.env.ENABLE_QUEUE_WORKERS !== "false") {
      const { isQueueEnabled } = await import("@/lib/queue/connection")
      if (isQueueEnabled) {
        await import("@/lib/queue/workers")
        const { initializeScheduledJobs } = await import("@/lib/queue/cron")
        await initializeScheduledJobs()
        logger.info("[Bootstrap] ✅ BullMQ workers and scheduled jobs started.")
      } else {
        logger.info("[Bootstrap] BullMQ workers skipped — REDIS_URL not configured.")
      }
    }

    bootstrapped = true
    logger.info("[Bootstrap] 🟢 All systems nominal. Commerce OS is live.")
  } catch (err) {
    logger.error({ message: "[Bootstrap] ❌ System initialization failed — continuing without queue/event wiring:", error: err })
  }
}

export function isBootstrapped(): boolean {
  return bootstrapped
}
