import { registerHandler } from "@/events/handlers/handler-registry"
import { processDomainEvent } from "./notification-engine"
import { EventType } from "@/events/contracts/events"

// Define core events that trigger user or admin notifications
const TARGETED_NOTIFICATIONS_EVENTS: EventType[] = [
  "ORDER_CREATED",
  "PAYMENT_COMPLETED",
  "USER_REGISTERED",
  "INVENTORY_RESERVED",
  "INVENTORY_RELEASED",
  "SHIPMENT_UPDATED",
  "REFUND_ISSUED",
  "REVIEW_CREATED",
]

/**
 * Initialize Notification Pipeline:
 * Binds domain event listeners on the core Event Bus and pipes triggered event envelopes
 * directly into the Notification Engine processing loop.
 */
export function initializeNotificationPipeline(): void {
  TARGETED_NOTIFICATIONS_EVENTS.forEach((eventType) => {
    registerHandler(eventType, async (envelope) => {
      try {
        await processDomainEvent(envelope)
      } catch (pipelineError) {
        console.error(
          `Notification Pipeline: Failed to route event ${envelope.eventId} (${eventType}) to notification engine:`,
          pipelineError
        )
      }
    })
  })
}
