import { redisPublish, redisSubscribe, redisSetNx } from "@/services/redis"
import { DomainEventEnvelope, EventType } from "../contracts/events"

const CHANNEL_PREFIX = "neoshop:events:"
const IDEMPOTENCY_KEY_PREFIX = "neoshop:events:processed:"

/**
 * Propagate event envelopes onto the distributed Redis Pub/Sub bus
 */
export async function publishEventToBus<T>(
  eventType: EventType,
  envelope: DomainEventEnvelope<T>
): Promise<number> {
  const channel = `${CHANNEL_PREFIX}${eventType}`
  return await redisPublish(channel, envelope)
}

/**
 * Subscribe to realtime channels on the Redis bus with replay protection
 */
export async function subscribeToBusEvent<T>(
  eventType: EventType,
  callback: (envelope: DomainEventEnvelope<T>) => void | Promise<void>
): Promise<void> {
  const channel = `${CHANNEL_PREFIX}${eventType}`
  await redisSubscribe(channel, async (message: string) => {
    try {
      const envelope = JSON.parse(message) as DomainEventEnvelope<T>
      
      // Idempotency check: Prevent duplicate processing (Replay Protection)
      if (envelope.eventId) {
        const lockKey = `${IDEMPOTENCY_KEY_PREFIX}${envelope.eventId}`
        // Set the lock with a 7-day expiration. NX ensures it only sets if it doesn't exist
        const acquired = await redisSetNx(lockKey, "1", 7 * 24 * 60 * 60)
        
        if (!acquired) {
          console.log(`[EventBus] Dropping duplicate event (Replay Protection): ${envelope.eventId}`)
          return
        }
      }

      // Cast ISO timestamp strings back to Date objects
      if (envelope.timestamp && typeof envelope.timestamp === "string") {
        envelope.timestamp = new Date(envelope.timestamp)
      }
      
      const res = callback(envelope)
      if (res instanceof Promise) {
        res.catch((err) => {
          console.error(`Async execution failure in subscriber callback for event ${eventType}:`, err)
        })
      }
    } catch (err) {
      console.error(`Failed to process event envelope on channel ${channel}:`, err)
    }
  })
}
