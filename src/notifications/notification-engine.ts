import { db } from "@/lib/db"
import { DomainEventEnvelope } from "@/events/contracts/events"
import { mapEventToNotification, NormalizedNotification } from "./notification-mapper"
import { routeNotification, DeliveryChannel } from "./notification-router"

// Registry for delivery strategies, to be populated dynamically by the strategies layer
type DeliveryStrategy = (notification: NormalizedNotification) => Promise<any>
const strategiesRegistry = new Map<DeliveryChannel, DeliveryStrategy>()

/**
 * Register a delivery strategy for a target channel
 */
export function registerDeliveryStrategy(channel: DeliveryChannel, strategy: DeliveryStrategy): void {
  strategiesRegistry.set(channel, strategy)
}

/**
 * Notification Engine:
 * Core e-commerce notification orchestrator. Receives Event Bus envelopes, maps payloads,
 * determines routing paths, triggers delivery strategies, and aggregates database notification records.
 */
export async function processDomainEvent(envelope: DomainEventEnvelope): Promise<void> {
  // 1. Map raw event to normalized notification request
  const notification = mapEventToNotification(envelope)
  if (!notification) {
    return // Telemetry or low-priority events are skipped
  }

  // 2. Decide delivery routing channels
  const channels = routeNotification(notification)

  // 3. Dispatch to all active delivery strategies in parallel
  await Promise.all(
    channels.map(async (channel) => {
      const strategy = strategiesRegistry.get(channel)
      if (strategy) {
        try {
          await strategy(notification)
        } catch (strategyError) {
          console.error(
            `Notification Engine: Strategy execution failure on channel ${channel} for user ${notification.userId}:`,
            strategyError
          )
        }
      }
    })
  )
}

/**
 * Mark a database notification record as read
 */
export async function markNotificationAsRead(notificationId: string) {
  return await db.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })
}

/**
 * Fetch all historical notification logs for a target user
 */
export async function getUserNotifications(userId: string) {
  return await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}

/**
 * Fetch the unread notification count for a target user
 */
export async function getUserUnreadCount(userId: string): Promise<number> {
  return await db.notification.count({
    where: {
      userId,
      read: false,
    },
  })
}
