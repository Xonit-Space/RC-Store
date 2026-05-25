import { db } from "@/lib/db"
import { sendWelcomeEmail, sendOrderConfirmation } from "@/services/email"
import { NormalizedNotification } from "../notification-mapper"
import { NotificationStrategy } from "./strategy-interface"

export class EmailStrategy implements NotificationStrategy {
  /**
   * Loads target user data and fires high-fidelity transactional emails via Resend
   */
  async send(notification: NormalizedNotification): Promise<any> {
    const userId = notification.userId
    if (!userId || userId === "admin") return

    // Query database to fetch user's contact coordinates
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    if (!user || !user.email) {
      console.warn(`Email Strategy skipped: user ${userId} has no registered email.`)
      return
    }

    const email = user.email
    const name = user.name || "Customer"

    if (notification.title.includes("Welcome")) {
      return await sendWelcomeEmail(email, name)
    }

    if (notification.type === "ORDER" && notification.title.includes("Created")) {
      const orderId = notification.metadata?.orderId || "unknown"
      const total = notification.metadata?.total || 0
      return await sendOrderConfirmation(email, orderId, total)
    }
  }
}
