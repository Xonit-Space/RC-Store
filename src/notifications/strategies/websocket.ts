import { subscriptionManager, globalWSGatewaySender } from "@/realtime/subscriptions/subscription-manager"
import { NormalizedNotification } from "../notification-mapper"
import { NotificationStrategy } from "./strategy-interface"

export class WebSocketStrategy implements NotificationStrategy {
  /**
   * Broadcasts notifications to connected browser client sockets in real-time
   */
  async send(notification: NormalizedNotification): Promise<any> {
    const targetChannels = [`notifications:${notification.userId}`]
    
    // Admin dashboard streams all events
    if (notification.userId === "admin") {
      targetChannels.push("admin:dashboard")
    }

    const sessionIds = new Set<string>()
    targetChannels.forEach((channel) => {
      subscriptionManager.getSubscribers(channel).forEach((sessionId) => {
        sessionIds.add(sessionId)
      })
    })

    if (sessionIds.size > 0 && globalWSGatewaySender) {
      globalWSGatewaySender(Array.from(sessionIds), {
        type: "event",
        channel: `notifications:${notification.userId}`,
        payload: {
          type: notification.type,
          title: notification.title,
          message: notification.message,
          metadata: notification.metadata,
          createdAt: new Date().toISOString(),
        },
      })
    }
  }
}
