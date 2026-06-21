import { registerHandler } from "@/events/handlers/handler-registry"
import { EventType, DomainEventEnvelope } from "@/events/contracts/events"
import { SocketSession } from "../types/socket"

class SubscriptionManager {
  // Map channels to connection session ID Sets
  private channelSubscriptions = new Map<string, Set<string>>()
  // Map connection session IDs to subscribed channel Sets (for quick disconnect cleanup)
  private sessionSubscriptions = new Map<string, Set<string>>()
  // Prevent duplicate Event Bus event listener hooks
  private hookedBusEvents = new Set<string>()

  /**
   * Subscribes a socket session to a channel
   */
  subscribe(sessionId: string, channel: string, session: SocketSession): void {
    // 1. Add session ID to target channel subscription list
    const sessions = this.channelSubscriptions.get(channel) || new Set<string>()
    sessions.add(sessionId)
    this.channelSubscriptions.set(channel, sessions)

    // 2. Add channel to session's subscription checklist
    const channels = this.sessionSubscriptions.get(sessionId) || new Set<string>()
    channels.add(channel)
    this.sessionSubscriptions.set(sessionId, channels)

    // 3. Connect Event Bus trigger bindings
    this.ensureEventBusHook(channel)
  }

  /**
   * Unsubscribes a socket session from a channel
   */
  unsubscribe(sessionId: string, channel: string): void {
    const sessions = this.channelSubscriptions.get(channel)
    if (sessions) {
      sessions.delete(sessionId)
      if (sessions.size === 0) {
        this.channelSubscriptions.delete(channel)
      }
    }

    const channels = this.sessionSubscriptions.get(sessionId)
    if (channels) {
      channels.delete(channel)
      if (channels.size === 0) {
        this.sessionSubscriptions.delete(sessionId)
      }
    }
  }

  /**
   * Clears all channel subscriptions for a socket session upon disconnect
   */
  unsubscribeAll(sessionId: string): void {
    const channels = this.sessionSubscriptions.get(sessionId)
    if (channels) {
      Array.from(channels).forEach((channel) => {
        this.unsubscribe(sessionId, channel)
      })
    }
  }

  /**
   * Get all active subscriber session IDs for a channel
   */
  getSubscribers(channel: string): Set<string> {
    return this.channelSubscriptions.get(channel) || new Set<string>()
  }

  /**
   * Clears subscription mappings (used for test isolation)
   */
  clear(): void {
    this.channelSubscriptions.clear()
    this.sessionSubscriptions.clear()
    this.hookedBusEvents.clear()
  }

  /**
   * Binds domain Event Bus events corresponding to the registered channel type
   */
  private ensureEventBusHook(channel: string): void {
    const parts = channel.split(":")
    const resourceType = parts[0]

    // Route domain events to corresponding websocket channel targets
    const eventTypeMap: Record<string, EventType[]> = {
      orders: ["ORDER_CREATED", "PAYMENT_COMPLETED", "SHIPMENT_UPDATED", "REFUND_ISSUED"],
      inventory: ["INVENTORY_RESERVED", "INVENTORY_RELEASED"],
      notifications: [
        "USER_REGISTERED",
        "ORDER_CREATED",
        "PAYMENT_COMPLETED",
        "SHIPMENT_UPDATED",
        "REFUND_ISSUED",
      ],
      admin: [
        "ORDER_CREATED", 
        "PAYMENT_COMPLETED", 
        "REVIEW_CREATED", 
        "CART_UPDATED", 
        "PRODUCT_VIEWED",
        "USER_REGISTERED",
        "REFUND_ISSUED"
      ],
      cart: ["CART_UPDATED"],
    }

    const eventsToHook = eventTypeMap[resourceType] || []
    eventsToHook.forEach((eventType) => {
      if (!this.hookedBusEvents.has(eventType)) {
        this.hookedBusEvents.add(eventType)

        registerHandler(eventType, (envelope: DomainEventEnvelope) => {
          this.broadcastEventBusMessage(eventType, envelope)
        })
      }
    })
  }

  /**
   * Translates Event Bus packets and pushes them to listening browser clients
   */
  private broadcastEventBusMessage(eventType: EventType, envelope: DomainEventEnvelope): void {
    const targetChannels = new Set<string>()
    const payload = envelope.payload as any

    // Admin dashboard streams all events
    targetChannels.add("admin:dashboard")

    // Determine specific target channels based on domain payload characteristics
    if (
      eventType === "ORDER_CREATED" ||
      eventType === "PAYMENT_COMPLETED" ||
      eventType === "SHIPMENT_UPDATED" ||
      eventType === "REFUND_ISSUED"
    ) {
      if (payload.orderId) {
        targetChannels.add(`orders:${payload.orderId}`)
      }
      if (payload.userId) {
        targetChannels.add(`notifications:${payload.userId}`)
      }
    } else if (eventType === "INVENTORY_RESERVED" || eventType === "INVENTORY_RELEASED") {
      payload.items?.forEach((item: any) => {
        if (item.variantId) {
          targetChannels.add(`inventory:${item.variantId}`)
        }
      })
    } else if (eventType === "USER_REGISTERED") {
      if (payload.userId) {
        targetChannels.add(`notifications:${payload.userId}`)
      }
    } else if (eventType === "REVIEW_CREATED") {
      if (payload.productId) {
        targetChannels.add(`inventory:${payload.productId}`)
      }
    } else if (eventType === "CART_UPDATED") {
      if (payload.userId) {
        targetChannels.add(`cart:${payload.userId}`)
      }
    } else if (eventType === "PRODUCT_VIEWED") {
      // Broadcast to admin dashboard only (already handled by admin:dashboard)
    }

    // Consolidate target subscriber sessions
    const subscriberSessionIds = new Set<string>()
    targetChannels.forEach((channel) => {
      this.getSubscribers(channel).forEach((sessionId) => {
        subscriberSessionIds.add(sessionId)
      })
    })

    // Forward payload frames to active socket clients
    if (subscriberSessionIds.size > 0 && globalWSGatewaySender) {
      globalWSGatewaySender(Array.from(subscriberSessionIds), {
        type: "event",
        channel: Array.from(targetChannels)[0], // Reference the primary trigger channel
        payload: envelope,
      })
    }
  }
}

// Global receiver callback handler populated by the WebSocket server gateway
export let globalWSGatewaySender: ((sessionIds: string[], message: any) => void) | null = null

export function setGlobalWSGatewaySender(
  sender: (sessionIds: string[], message: any) => void
): void {
  globalWSGatewaySender = sender
}

export const subscriptionManager = new SubscriptionManager()
export type { SubscriptionManager }
