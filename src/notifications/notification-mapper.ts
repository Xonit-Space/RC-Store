import { DomainEventEnvelope, EventType } from "@/events/contracts/events"
import { NotificationType } from "@prisma/client"

export interface NormalizedNotification {
  userId: string // Target user recipient ID (or "admin" for admin notifications)
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, any>
}

/**
 * Notification Mapper:
 * Normalizes asynchronous domain event envelopes into unified, consistent e-commerce notifications.
 */
export function mapEventToNotification(envelope: DomainEventEnvelope): NormalizedNotification | null {
  const { eventType, payload: rawPayload } = envelope
  const payload = rawPayload as any

  switch (eventType as EventType) {
    case "ORDER_CREATED":
      return {
        userId: payload.userId || "admin",
        type: "ORDER",
        title: "Order Created Successfully",
        message: `Thank you! Your order #{payload.orderId} of total ${payload.total.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})} has been registered.`,
        metadata: { orderId: payload.orderId, total: payload.total },
      }

    case "PAYMENT_COMPLETED":
      return {
        userId: payload.userId || "admin", // Fallback to admin if no user ID mapped
        type: "PAYMENT",
        title: "Payment Processed",
        message: `Payment of ${payload.amount.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})} for order #${payload.orderId} was processed successfully.`,
        metadata: { orderId: payload.orderId, paymentId: payload.paymentId, amount: payload.amount },
      }

    case "INVENTORY_RESERVED":
      return {
        userId: "admin", // Admin warning only
        type: "INVENTORY",
        title: "Inventory Stock Reserved",
        message: `Stock of items for reservation #${payload.reservationId} has been temporarily locked.`,
        metadata: { reservationId: payload.reservationId, expiresAt: payload.expiresAt },
      }

    case "INVENTORY_RELEASED":
      return {
        userId: "admin",
        type: "INVENTORY",
        title: "Inventory Stock Released",
        message: `Stock reserved under reservation #${payload.reservationId} was released due to: ${payload.reason}.`,
        metadata: { reservationId: payload.reservationId, reason: payload.reason },
      }

    case "USER_REGISTERED":
      return {
        userId: payload.userId,
        type: "SYSTEM",
        title: "Welcome to RC Store!",
        message: `Hi ${payload.name || "Customer"}, your account registration was completed successfully.`,
        metadata: { userId: payload.userId, email: payload.email },
      }

    case "REVIEW_CREATED":
      return {
        userId: "admin",
        type: "PROMO",
        title: "New Product Review",
        message: `A new ${payload.rating}-star review was added to product #${payload.productId}.`,
        metadata: { reviewId: payload.reviewId, productId: payload.productId, rating: payload.rating },
      }

    case "REFUND_ISSUED":
      return {
        userId: "admin",
        type: "PAYMENT",
        title: "Refund Processed",
        message: `A refund of ${payload.amount.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})} has been processed for order #${payload.orderId}.`,
        metadata: { refundId: payload.refundId, orderId: payload.orderId, amount: payload.amount },
      }

    case "SHIPMENT_UPDATED":
      return {
        userId: payload.userId || "admin",
        type: "ORDER",
        title: "Shipment Status Updated",
        message: `Your order #${payload.orderId} shipment status changed to: ${payload.status}. Tracking: ${payload.trackingNumber}.`,
        metadata: { shipmentId: payload.shipmentId, orderId: payload.orderId, status: payload.status },
      }

    case "PRODUCT_VIEWED":
    case "CART_UPDATED":
    default:
      // These telemetry/low-priority events do not trigger immediate notification broadcasts
      return null
  }
}
