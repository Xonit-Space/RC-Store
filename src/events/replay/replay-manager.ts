import { db } from "@/lib/db"
import { executeHandlers } from "../handlers/handler-registry"
import { DomainEventEnvelope, EventType } from "../contracts/events"

export interface ReplayOptions {
  eventType?: EventType
  from?: Date
  to?: Date
  status?: string
}

export interface ReplayResult {
  total: number
  replayed: number
  failed: number
}

/**
 * Historical Replay Manager:
 * Queries event ledgers in PostgreSQL and chronologically replays logs
 * directly to registered subscriber execution handlers for state synchronization.
 */
export async function replayEvents(options: ReplayOptions = {}): Promise<ReplayResult> {
  const { eventType, from, to, status } = options

  // 1. Fetch domain logs filtered by targeted parameters
  const eventLogs = await db.domainEventLog.findMany({
    where: {
      ...(eventType && { eventType }),
      ...(status && { status }),
      ...((from || to) && {
        createdAt: {
          ...(from && { gte: from }),
          ...(to && { lte: to }),
        },
      }),
    },
    orderBy: {
      createdAt: "asc", // Crucial: Replay in strict chronological order to avoid race conditions!
    },
  })

  let replayedCount = 0
  let failedCount = 0

  // 2. Iterate and play back events directly through handlers
  for (const log of eventLogs) {
    try {
      const payload = JSON.parse(log.payload)
      const envelope: DomainEventEnvelope = {
        eventId: log.eventId,
        eventType: log.eventType,
        timestamp: log.createdAt,
        payload,
        signature: log.signature || undefined,
      }

      // Re-route directly through our local handler registry execution
      await executeHandlers(log.eventType as EventType, envelope)

      // Update log execution status in database ledger
      await db.domainEventLog.update({
        where: { id: log.id },
        data: { status: "REPLAYED" },
      })

      replayedCount++
    } catch (replayError) {
      console.error(`Replay Engine failed to process event ${log.eventId} (${log.eventType}):`, replayError)
      
      await db.domainEventLog.update({
        where: { id: log.id },
        data: { status: "FAILED" },
      }).catch(() => {})

      failedCount++
    }
  }

  return {
    total: eventLogs.length,
    replayed: replayedCount,
    failed: failedCount,
  }
}
