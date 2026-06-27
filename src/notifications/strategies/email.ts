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
      const orderId = notification.metadata?.orderId
      if (orderId) {
        const order = await db.order.findUnique({
          where: { orderNumber: orderId },
          include: { items: { include: { variant: { include: { product: true } }, addon: true } }, shippingAddress: true }
        })
        if (order) {
          const sd = order.shippingAddress
          return await sendOrderConfirmation({
            email,
            orderNumber: order.orderNumber,
            customerName: name,
            items: order.items.map(item => ({
              id: item.id,
              name: item.variant?.product.name || item.addon?.name || "Product",
              quantity: item.quantity,
              price: Number(item.price),
            })),
            subtotal: Number(order.subtotal),
            tax: Number(order.tax),
            shipping: Number(order.shippingCost),
            total: Number(order.total),
            shippingAddress: sd ? `${sd.line1}, ${sd.city}, ${sd.state} ${sd.postalCode}, ${sd.country}` : "Address provided at checkout",
          })
        }
      }
    }
  }
}
