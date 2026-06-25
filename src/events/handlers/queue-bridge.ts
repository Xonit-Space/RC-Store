import { registerHandler } from "./handler-registry"
import { isServerless } from "@/lib/runtime"
import { sendEmailJob, EmailJobData } from "@/services/email-job"
import { trackAnalyticsJob, AnalyticsJobData } from "@/services/analytics-job"
import { logger } from "@/lib/logger"

async function getQueues() {
  const { emailQueue, analyticsQueue, inventoryQueue, webhookQueue } = await import("@/lib/queue/client")
  return { emailQueue, analyticsQueue, inventoryQueue, webhookQueue }
}

async function enqueueEmail(data: EmailJobData): Promise<void> {
  if (isServerless) {
    await sendEmailJob(data)
    return
  }
  const { emailQueue } = await getQueues()
  await emailQueue.add(data.subject.toLowerCase().replace(/\s+/g, "_"), data)
}

async function enqueueAnalytics(name: string, data: AnalyticsJobData): Promise<void> {
  if (isServerless) {
    await trackAnalyticsJob(data)
    return
  }
  const { analyticsQueue } = await getQueues()
  await analyticsQueue.add(name, data)
}

async function enqueueInventory(name: string, data: Record<string, unknown>): Promise<void> {
  if (isServerless) {
    logger.info({ message: `[QueueBridge] Inline inventory job: ${name}`, context: data })
    return
  }
  const { inventoryQueue } = await getQueues()
  await inventoryQueue.add(name, data)
}

async function enqueueWebhook(name: string, data: Record<string, unknown>): Promise<void> {
  if (isServerless) {
    logger.info({ message: `[QueueBridge] Inline webhook job: ${name}`, context: data })
    return
  }
  const { webhookQueue } = await getQueues()
  await webhookQueue.add(name, data)
}

/**
 * Initializes the bridge between the domain Event Bus and the BullMQ background workers.
 * Maps high-level e-commerce events to asynchronous worker queues.
 */
export function initializeQueueBridge(): void {

  registerHandler("USER_REGISTERED", async (envelope) => {
    await enqueueEmail({
      to: envelope.payload.email,
      subject: "Welcome to RC Store",
      html: "<p>Welcome to the premium fashion experience.</p>"
    })

    await enqueueAnalytics("track_registration", {
      event: "USER_REGISTERED",
      userId: envelope.payload.userId
    })
  })

  registerHandler("ORDER_CREATED", async (envelope) => {
    await enqueueAnalytics("track_order", {
      event: "ORDER_CREATED",
      userId: envelope.payload.userId,
      payload: envelope.payload
    })

    await enqueueWebhook("erp_sync", {
      url: "https://erp.internal/webhooks/orders",
      payload: envelope.payload
    })
  })

  registerHandler("INVENTORY_RESERVED", async (envelope) => {
    await enqueueInventory("process_reservation", {
      action: "RESERVE",
      orderId: envelope.payload.reservationId
    })
  })

  registerHandler("INVENTORY_RELEASED", async (envelope) => {
    await enqueueInventory("release_reservation", {
      action: "RELEASE",
      orderId: envelope.payload.reservationId
    })
  })

  registerHandler("PAYMENT_COMPLETED", async (envelope) => {
    await enqueueEmail({
      to: "customer@example.com",
      subject: "Payment Receipt - RC Store",
      html: `<p>We have received your payment of $${envelope.payload.amount} for order ${envelope.payload.orderId}.</p>`
    })
  })

  registerHandler("REFUND_ISSUED", async (envelope) => {
    await enqueueEmail({
      to: "customer@example.com",
      subject: "Refund Issued - RC Store",
      html: `<p>A refund of $${envelope.payload.amount} has been issued for order ${envelope.payload.orderId}.</p>`
    })
  })

  registerHandler("SHIPMENT_UPDATED", async (envelope) => {
    await enqueueEmail({
      to: "customer@example.com",
      subject: `Shipment Update: ${envelope.payload.status}`,
      html: `<p>Your order ${envelope.payload.orderId} is now ${envelope.payload.status}. Tracking: ${envelope.payload.trackingNumber}</p>`
    })
  })

  registerHandler("PRODUCT_VIEWED", async (envelope) => {
    await enqueueAnalytics("track_view", {
      event: "PRODUCT_VIEWED",
      productId: envelope.payload.productId,
      userId: envelope.payload.userId || envelope.payload.anonymousId
    })
  })

  registerHandler("CART_UPDATED", async (envelope) => {
    await enqueueAnalytics("track_cart", {
      event: "CART_UPDATED",
      cartId: envelope.payload.cartId,
      userId: envelope.payload.userId
    })
  })

  registerHandler("REVIEW_CREATED", async (envelope) => {
    await enqueueAnalytics("track_review", {
      event: "REVIEW_CREATED",
      productId: envelope.payload.productId,
      rating: envelope.payload.rating
    })
  })
}
