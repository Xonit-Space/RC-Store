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
      subject: "Welcome to Neoshop Ultra",
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
}
