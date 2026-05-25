import { redisPublish, redisSubscribe } from "@/services/redis"
import { DomainEventEnvelope, EventType } from "../contracts/events"

const CHANNEL_PREFIX = "neoshop:events:"

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
 * Subscribe to realtime channels on the Redis bus
 */
export async function subscribeToBusEvent<T>(
  eventType: EventType,
  callback: (envelope: DomainEventEnvelope<T>) => void | Promise<void>
): Promise<void> {
  const channel = `${CHANNEL_PREFIX}${eventType}`
  await redisSubscribe(channel, (message: string) => {
    try {
      const envelope = JSON.parse(message) as DomainEventEnvelope<T>
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
