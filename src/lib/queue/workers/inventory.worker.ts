import { Job } from "bullmq"
import { createWorker } from "../worker"
import { db } from "@/lib/db"
import { releaseStock } from "@/services/inventory"
import { releaseExpiredReservations } from "@/services/reservation"
import { OrderStatus } from "@prisma/client"
import { logger } from "@/lib/logger"

export const inventoryWorker = createWorker("inventory", async (job: Job) => {
  const { action, orderNumber, items } = job.data

  // Action 1: Release reservation after old-style abandoned checkout
  if (action === "RELEASE_RESERVATION") {
    logger.info(`[InventoryWorker] Checking stock reservation for order: ${orderNumber}`)

    if (!items || items.length === 0) {
      logger.warn(`[InventoryWorker] Job received with empty items list for order: ${orderNumber}`)
      return { success: false, reason: "No items listed in reservation" }
    }

    try {
      const order = await db.order.findUnique({ where: { orderNumber } })

      if (order && order.status !== OrderStatus.PENDING) {
        logger.info(`[InventoryWorker] Order ${orderNumber} already committed (${order.status}). Skipping release.`)
        return { success: true, released: false, committed: true }
      }

      logger.info(`[InventoryWorker] Releasing abandoned stock reservation for order: ${orderNumber}`)
      for (const item of items) {
        await releaseStock(item.variantId, item.quantity)
      }

      logger.info(`[InventoryWorker] Released reserved stock for order ${orderNumber}`)
      return { success: true, released: true }

    } catch (err: any) {
      logger.error({ message: `[InventoryWorker] Release failed for order ${orderNumber}:`, error: err })
      throw err
    }
  }

  // Action 2: Sweep expired InventoryReservation rows (3-phase engine)
  if (action === "EXPIRE_RESERVATIONS") {
    logger.info("[InventoryWorker] Sweeping expired inventory reservations...")
    try {
      const count = await releaseExpiredReservations()
      logger.info(`[InventoryWorker] Released ${count} expired reservations.`)
      return { success: true, releasedCount: count }
    } catch (err: any) {
      logger.error({ message: "[InventoryWorker] Reservation sweep failed:", error: err.message })
      throw err
    }
  }

  // Action 3: Hourly inventory sync (existing)
  if (action === "SYNC") {
    logger.info("[InventoryWorker] Running hourly inventory integrity sync...")
    return { success: true, action: "SYNC" }
  }

  return { success: false, reason: `Unknown action: ${action}` }
})
