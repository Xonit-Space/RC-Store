import { registerHandler } from "./handler-registry"
import { 
  emailQueue, 
  analyticsQueue, 
  inventoryQueue, 
  webhookQueue 
} from "@/lib/queue"

/**
 * Initializes the bridge between the domain Event Bus and the BullMQ background workers.
 * Maps high-level e-commerce events to asynchronous worker queues.
 */
export function initializeQueueBridge(): void {
  
  // 1. User Registration Flow
  registerHandler("USER_REGISTERED", async (envelope) => {
    await emailQueue.add("welcome_email", {
      to: envelope.payload.email,
      subject: "Welcome to RC Store",
      html: "<p>Welcome to the premium fashion experience.</p>"
    })
    
    await analyticsQueue.add("track_registration", {
      event: "USER_REGISTERED",
      userId: envelope.payload.userId
    })
  })

  // 2. Order Processing Flow
  registerHandler("ORDER_CREATED", async (envelope) => {
    await analyticsQueue.add("track_order", {
      event: "ORDER_CREATED",
      userId: envelope.payload.userId,
      payload: envelope.payload
    })
    
    // Broadcast external webhook payload to internal ERP systems
    await webhookQueue.add("erp_sync", {
      url: "https://erp.internal/webhooks/orders",
      payload: envelope.payload
    })
  })

  // 3. Inventory Stock Allocation Flow
  registerHandler("INVENTORY_RESERVED", async (envelope) => {
    await inventoryQueue.add("process_reservation", {
      action: "RESERVE",
      orderId: envelope.payload.reservationId
    })
  })

  registerHandler("INVENTORY_RELEASED", async (envelope) => {
    await inventoryQueue.add("release_reservation", {
      action: "RELEASE",
      orderId: envelope.payload.reservationId
    })
  })

  // 4. Payment & Refund Flow
  registerHandler("PAYMENT_COMPLETED", async (envelope) => {
    await emailQueue.add("receipt_email", {
      to: "customer@example.com", // In a real app, fetch order/user email
      subject: "Payment Receipt - RC Store",
      html: `<p>We have received your payment of $${envelope.payload.amount} for order ${envelope.payload.orderId}.</p>`
    })
  })

  registerHandler("REFUND_ISSUED", async (envelope) => {
    await emailQueue.add("refund_email", {
      to: "customer@example.com",
      subject: "Refund Issued - RC Store",
      html: `<p>A refund of $${envelope.payload.amount} has been issued for order ${envelope.payload.orderId}.</p>`
    })
  })

  // 5. Shipping Flow
  registerHandler("SHIPMENT_UPDATED", async (envelope) => {
    await emailQueue.add("shipment_update", {
      to: "customer@example.com",
      subject: `Shipment Update: ${envelope.payload.status}`,
      html: `<p>Your order ${envelope.payload.orderId} is now ${envelope.payload.status}. Tracking: ${envelope.payload.trackingNumber}</p>`
    })
  })

  // 6. Analytics Flows
  registerHandler("PRODUCT_VIEWED", async (envelope) => {
    await analyticsQueue.add("track_view", {
      event: "PRODUCT_VIEWED",
      productId: envelope.payload.productId,
      userId: envelope.payload.userId || envelope.payload.anonymousId
    })
  })

  registerHandler("CART_UPDATED", async (envelope) => {
    await analyticsQueue.add("track_cart", {
      event: "CART_UPDATED",
      cartId: envelope.payload.cartId,
      userId: envelope.payload.userId
    })
  })

  registerHandler("REVIEW_CREATED", async (envelope) => {
    await analyticsQueue.add("track_review", {
      event: "REVIEW_CREATED",
      productId: envelope.payload.productId,
      rating: envelope.payload.rating
    })
  })
}
