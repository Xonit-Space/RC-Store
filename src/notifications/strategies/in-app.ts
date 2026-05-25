import { db } from "@/lib/db"
import { NormalizedNotification } from "../notification-mapper"
import { NotificationStrategy } from "./strategy-interface"

export class InAppStrategy implements NotificationStrategy {
  /**
   * Persists the notification record to the PostgreSQL database log
   */
  async send(notification: NormalizedNotification): Promise<any> {
    return await db.notification.create({
      data: {
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: false,
        metadata: notification.metadata || undefined,
      },
    })
  }
}
