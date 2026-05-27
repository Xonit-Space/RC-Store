import { Job } from "bullmq"
import { createWorker } from "../worker"
import { db } from "@/lib/db"
import { releaseStock } from "@/services/inventory"
import { releaseExpiredReservations } from "@/services/reservation"
import { OrderStatus } from "@prisma/client"

export const inventoryWorker = createWorker("inventory", async (job: Job) => {
  const { action, orderNumber, items } = job.data

  // Action 1: Release reservation after old-style abandoned checkout
  if (action === "RELEASE_RESERVATION") {
    console.log(`[InventoryWorker] Checking stock reservation for order: ${orderNumber}`)

    if (!items || items.length === 0) {
      console.warn(`[InventoryWorker] Job received with empty items list for order: ${orderNumber}`)
      return { success: false, reason: "No items listed in reservation" }
    }

    try {
      const order = await db.order.findUnique({ where: { orderNumber } })

      if (order && order.status !== OrderStatus.PENDING) {
        console.log(`[InventoryWorker] Order ${orderNumber} already committed (${order.status}). Skipping release.`)
        return { success: true, released: false, committed: true }
      }

      console.log(`[InventoryWorker] Releasing abandoned stock reservation for order: ${orderNumber}`)
      for (const item of items) {
        await releaseStock(item.variantId, item.quantity)
      }

      console.log(`[InventoryWorker] Released reserved stock for order ${orderNumber}`)
      return { success: true, released: true }

    } catch (err: any) {
      console.error(`[InventoryWorker] Release failed for order ${orderNumber}:`, err)
      throw err
    }
  }

  // Action 2: Sweep expired InventoryReservation rows (3-phase engine)
  if (action === "EXPIRE_RESERVATIONS") {
    console.log("[InventoryWorker] Sweeping expired inventory reservations...")
    try {
      const count = await releaseExpiredReservations()
      console.log(`[InventoryWorker] Released ${count} expired reservations.`)
      return { success: true, releasedCount: count }
    } catch (err: any) {
      console.error("[InventoryWorker] Reservation sweep failed:", err.message)
      throw err
    }
  }

  // Action 3: Hourly inventory sync (existing)
  if (action === "SYNC") {
    console.log("[InventoryWorker] Running hourly inventory integrity sync...")
    return { success: true, action: "SYNC" }
  }

  return { success: false, reason: `Unknown action: ${action}` }
})
