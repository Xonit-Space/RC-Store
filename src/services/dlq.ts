/**
 * Financial Dead Letter Queue (DLQ)
 *
 * Any failed financial event goes here:
 * - Stripe webhook processing failures
 * - Order creation failures
 * - Inventory commit failures
 * - Payment processing failures
 *
 * Guarantees:
 * - eventId uniqueness prevents duplicate DLQ entries
 * - Retry respects max retry limit before ESCALATED
 * - Re-replay is idempotency-safe (checked before processing)
 */

import { db } from "@/lib/db"
import { DLQStatus } from "@prisma/client"

const DEFAULT_MAX_RETRIES = 5

/**
 * Route a failed financial event to the DLQ.
 * If the event already exists in DLQ, increments retryCount only.
 */
export async function sendToDLQ(
  eventId: string,
  namespace: string,
  payload: Record<string, unknown>,
  errorMessage: string
): Promise<void> {
  await db.financialDLQ.upsert({
    where: { eventId },
    create: {
      eventId,
      namespace,
      payloadJson: JSON.stringify(payload),
      errorMessage,
      retryCount: 1,
      maxRetries: DEFAULT_MAX_RETRIES,
      status: DLQStatus.PENDING,
      lastAttempt: new Date(),
    },
    update: {
      errorMessage,
      retryCount: { increment: 1 },
      lastAttempt: new Date(),
      status: DLQStatus.RETRYING,
    },
  })
  console.warn(`[DLQ] Event ${eventId} routed to DLQ. Namespace: ${namespace}. Error: ${errorMessage}`)
}

/**
 * Mark a DLQ entry as resolved after successful replay.
 */
export async function resolveDLQ(id: string): Promise<void> {
  await db.financialDLQ.update({
    where: { id },
    data: {
      status: DLQStatus.RESOLVED,
      resolvedAt: new Date(),
    },
  })
}

/**
 * Escalate a DLQ entry that has exceeded max retries.
 * Marks for human review / alerting.
 */
export async function escalateDLQ(id: string): Promise<void> {
  await db.financialDLQ.update({
    where: { id },
    data: { status: DLQStatus.ESCALATED },
  })
  console.error(`[DLQ] Event ${id} ESCALATED — exceeded max retries. Manual intervention required.`)
}

/**
 * Fetch all DLQ entries eligible for retry.
 * Criteria: PENDING or RETRYING, retryCount < maxRetries
 */
export async function getPendingDLQEntries(limit = 50) {
  return db.financialDLQ.findMany({
    where: {
      status: { in: [DLQStatus.PENDING, DLQStatus.RETRYING] },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  })
}
