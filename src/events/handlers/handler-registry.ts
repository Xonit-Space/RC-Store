import { subscribeToBusEvent } from "../bus/event-bus"
import { verifyEventSignature } from "../emitters/emitter"
import { DomainEventEnvelope, EventType } from "../contracts/events"

export type EventHandler<T = any> = (envelope: DomainEventEnvelope<T>) => void | Promise<void>

const handlerMap = new Map<string, Array<EventHandler>>()
const subscribedEvents = new Set<string>()

/**
 * Register a listener to execute operations when a target domain event triggers
 */
export function registerHandler<T = any>(
  eventType: EventType,
  handler: EventHandler<T>
): void {
  const handlers = handlerMap.get(eventType) || []
  handlerMap.set(eventType, [...handlers, handler])

  // Automatically establish connection to Event Bus upon first listener registration
  if (!subscribedEvents.has(eventType)) {
    subscribedEvents.add(eventType)
    
    subscribeToBusEvent(eventType, async (envelope) => {
      try {
        await executeHandlers(eventType, envelope)
      } catch (err) {
        console.error(`Security guard or executor blocked message ${envelope.eventId} propagation:`, err)
      }
    }).catch((err) => {
      console.error(`Failed to wire Event Bus subscriptions for ${eventType}:`, err)
    })
  }
}

/**
 * Enforces cryptographic HMAC signature checks and routes domain events to callbacks
 */
export async function executeHandlers(
  eventType: EventType,
  envelope: DomainEventEnvelope
): Promise<void> {
  // Reject untrusted payloads immediately to prevent replay attack vector
  if (!verifyEventSignature(envelope)) {
    const alertMsg = `SECURITY ALERT: Event packet signature validation failed for event ${envelope.eventId} of type ${eventType}`
    console.error(alertMsg)
    throw new Error(`Security violation: Event packet has unsigned or tampered contents`)
  }

  const handlers = handlerMap.get(eventType) || []

  // Execute all registered callback operations in parallel
  await Promise.all(
    handlers.map(async (handler) => {
      try {
        const result = handler(envelope)
        if (result instanceof Promise) {
          await result
        }
      } catch (handlerError) {
        console.error(
          `Domain event handler error executing callback on event ${envelope.eventId} (${eventType}):`,
          handlerError
        )
      }
    })
  )
}

/**
 * Sandbox reset helper (primarily used for test suite isolation)
 */
export function clearAllHandlers(): void {
  handlerMap.clear()
  subscribedEvents.clear()
}
