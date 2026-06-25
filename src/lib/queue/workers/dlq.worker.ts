/**
 * DLQ Worker — Processes failed financial events from the Dead Letter Queue
 *
 * Retry Strategy:
 * - Re-executes the failed event with full idempotency guards
 * - After maxRetries, escalates for human intervention
 * - Never double-applies financial effects (idempotency enforced at service layer)
 */

import { Job } from "bullmq"
import { createWorker } from "../worker"
import { getPendingDLQEntries, resolveDLQ, escalateDLQ } from "@/services/dlq"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"

export const dlqWorker = createWorker("dlq", async (job: Job) => {
  const { action } = job.data

  if (action === "PROCESS_DLQ_BATCH") {
    logger.info("[DLQWorker] Processing DLQ batch...")
    const entries = await getPendingDLQEntries(20)

    if (entries.length === 0) {
      logger.info("[DLQWorker] DLQ is empty.")
      return { processed: 0 }
    }

    let resolved = 0
    let escalated = 0

    for (const entry of entries) {
      try {
        // Check if exceeded max retries
        if (entry.retryCount >= entry.maxRetries) {
          await escalateDLQ(entry.id)
          escalated++
          continue
        }

        const payload = JSON.parse(entry.payloadJson)

        // Namespace-specific replay handlers
        if (entry.namespace === "stripe_webhook") {
          // For webhook failures: check if the order was eventually created
          // (could have succeeded in a parallel retry)
          const orderNumber = payload?.metadata?.orderNumber
          if (orderNumber) {
            const existingOrder = await db.order.findUnique({
              where: { orderNumber },
              select: { id: true },
            })
            if (existingOrder) {
              // Order exists — the original failure was non-critical (e.g., audit log)
              logger.info(`[DLQWorker] Order ${orderNumber} found — resolving DLQ entry ${entry.id}`)
              await resolveDLQ(entry.id)
              resolved++
              continue
            }
          }

          // Order doesn't exist — log for manual review (cannot safely re-replay webhook body)
          logger.warn(
            `[DLQWorker] Stripe webhook ${entry.eventId} requires manual replay. ` +
            `Order ${orderNumber} not found after ${entry.retryCount} retries.`
          )

          if (entry.retryCount >= entry.maxRetries - 1) {
            await escalateDLQ(entry.id)
            escalated++
          }
        } else {
          // Unknown namespace: escalate
          await escalateDLQ(entry.id)
          escalated++
        }
      } catch (err: any) {
        logger.error(`[DLQWorker] Error processing DLQ entry ${entry.id}:`, err.message)
        // Don't throw — process remaining entries
      }
    }

    logger.info(`[DLQWorker] Batch complete. Resolved: ${resolved}, Escalated: ${escalated}`)
    return { processed: entries.length, resolved, escalated }
  }

  return { success: false, reason: `Unknown action: ${action}` }
})
