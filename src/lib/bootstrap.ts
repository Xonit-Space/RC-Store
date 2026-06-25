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

import { initializeQueueBridge } from "@/events/handlers/queue-bridge"
import { initializeNotificationPipeline } from "@/notifications/event-subscriber"
import { logger } from "@/lib/logger"

let bootstrapped = false

export function bootstrapBackendSystems(): void {
  if (bootstrapped) {
    logger.info("[Bootstrap] Systems already initialized. Skipping duplicate call.")
    return
  }

  logger.info("[Bootstrap] 🚀 Initializing RC Store backend systems...")

  try {
    // 1. Wire Event Bus → BullMQ Queue Workers
    initializeQueueBridge()
    logger.info("[Bootstrap] ✅ Queue Bridge: Event Bus → BullMQ workers wired.")

    // 2. Wire Event Bus → Notification Engine (DB + Push)
    initializeNotificationPipeline()
    logger.info("[Bootstrap] ✅ Notification Pipeline: Event Bus → Notification Engine wired.")

    bootstrapped = true
    logger.info("[Bootstrap] 🟢 All systems nominal. Commerce OS is live.")
  } catch (err) {
    logger.error({ message: "[Bootstrap] ❌ CRITICAL: System initialization failed:", error: err })
    // Do not set bootstrapped = true — allow retry on next invocation
    throw err
  }
}

export function isBootstrapped(): boolean {
  return bootstrapped
}
