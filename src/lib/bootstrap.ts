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

let bootstrapped = false

export function bootstrapBackendSystems(): void {
  if (bootstrapped) {
    console.log("[Bootstrap] Systems already initialized. Skipping duplicate call.")
    return
  }

  console.log("[Bootstrap] 🚀 Initializing Neoshop Ultra backend systems...")

  try {
    // 1. Wire Event Bus → BullMQ Queue Workers
    initializeQueueBridge()
    console.log("[Bootstrap] ✅ Queue Bridge: Event Bus → BullMQ workers wired.")

    // 2. Wire Event Bus → Notification Engine (DB + Push)
    initializeNotificationPipeline()
    console.log("[Bootstrap] ✅ Notification Pipeline: Event Bus → Notification Engine wired.")

    bootstrapped = true
    console.log("[Bootstrap] 🟢 All systems nominal. Commerce OS is live.")
  } catch (err) {
    console.error("[Bootstrap] ❌ CRITICAL: System initialization failed:", err)
    // Do not set bootstrapped = true — allow retry on next invocation
    throw err
  }
}

export function isBootstrapped(): boolean {
  return bootstrapped
}
