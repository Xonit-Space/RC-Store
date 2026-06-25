/**
 * 3-Phase Inventory Reservation Engine
 *
 * Phase 1 — RESERVE:  Hold stock during checkout session (TTL-bounded)
 * Phase 2 — COMMIT:   Convert reservation to final sale on payment success
 * Phase 3 — RELEASE:  Return stock on failure, timeout, or cancellation
 *
 * Guarantees:
 * - No oversell: RESERVE checks available = quantity - reserved with FOR UPDATE lock
 * - No double commit: COMMIT checks reservation status before decrement
 * - TTL safety: Expired reservations are swept by the inventory worker cron
 */

import { db } from "@/lib/db"
import { ReservationStatus } from "@prisma/client"
import { logger } from "@/lib/logger"

export interface ReservationInput {
  variantId: string
  quantity: number
  checkoutId: string   // Stripe session ID or POS transaction ID
  ttlMinutes?: number  // Default: 15 minutes
}

/**
 * PHASE 1: RESERVE
 * Atomically locks inventory quantity for a checkout session.
 * Uses FOR UPDATE to prevent concurrent over-reservation.
 */
export async function createReservation(input: ReservationInput) {
  const { variantId, quantity, checkoutId, ttlMinutes = 15 } = input
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)

  return db.$transaction(async (tx) => {
    // 1. Pessimistic lock on inventory row
    const inventories = await tx.$queryRaw<Array<{ id: string, quantity: number, reserved: number }>>`
      SELECT id, quantity, reserved FROM inventory
      WHERE "variantId" = ${variantId}
      FOR UPDATE
    `
    const inv = inventories[0]
    if (!inv) throw new Error(`Inventory not found for variant: ${variantId}`)

    const available = inv.quantity - inv.reserved
    if (available < quantity) {
      throw new Error(
        `Insufficient stock for variant ${variantId}. Available: ${available}, Requested: ${quantity}`
      )
    }

    // 2. Increment the reserved counter
    await tx.inventory.update({
      where: { id: inv.id },
      data: { reserved: { increment: quantity } },
    })

    // 3. Create the reservation record
    const reservation = await tx.inventoryReservation.create({
      data: {
        variantId,
        quantity,
        checkoutId,
        status: ReservationStatus.RESERVED,
        expiresAt,
      },
    })

    return reservation
  })
}

/**
 * PHASE 2: COMMIT
 * Converts a RESERVED reservation to a final COMMITTED sale.
 * Decrements actual inventory quantity (not just the reserved counter).
 * Double-commit is impossible: status check prevents re-commit.
 */
export async function commitReservation(reservationId: string) {
  return db.$transaction(async (tx) => {
    // 1. Lock the reservation row
    const reservations = await tx.$queryRaw<Array<{ id: string, variantId: string, quantity: number, status: string, expiresAt: Date, checkoutId: string }>>`
      SELECT id, "variantId", quantity, status FROM inventory_reservations
      WHERE id = ${reservationId}
      FOR UPDATE
    `
    const reservation = reservations[0]
    if (!reservation) throw new Error(`Reservation ${reservationId} not found`)

    // Guard: only RESERVED reservations can be committed
    if (reservation.status !== "RESERVED") {
      throw new Error(
        `Cannot commit reservation ${reservationId}: status is ${reservation.status} (expected RESERVED)`
      )
    }

    // Guard: check expiry
    const now = new Date()
    if (new Date(reservation.expiresAt) < now) {
      throw new Error(`Reservation ${reservationId} has expired — cannot commit`)
    }

    // 2. Lock inventory and verify quantities
    const inventories = await tx.$queryRaw<Array<{ id: string, quantity: number, reserved: number }>>`
      SELECT id, quantity, reserved FROM inventory
      WHERE "variantId" = ${reservation.variantId}
      FOR UPDATE
    `
    const inv = inventories[0]
    if (!inv) throw new Error(`Inventory not found for reservation ${reservationId}`)

    // 3. Atomic commit: decrement actual quantity + release reservation counter
    await tx.inventory.update({
      where: { id: inv.id },
      data: {
        quantity: { decrement: reservation.quantity },
        reserved: { decrement: Math.min(inv.reserved, reservation.quantity) },
      },
    })

    // 4. Log movement
    await tx.inventoryMovement.create({
      data: {
        inventoryId: inv.id,
        quantity: -reservation.quantity,
        type: "SHIPMENT",
        reason: `Reservation commit: ${reservationId} for checkout ${reservation.checkoutId}`,
      },
    })

    // 5. Mark reservation as committed
    return tx.inventoryReservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.COMMITTED,
        committedAt: new Date(),
      },
    })
  })
}

/**
 * PHASE 3: RELEASE
 * Returns reserved stock on checkout failure, timeout, or cancellation.
 * Safe to call multiple times — status check prevents double-release.
 */
export async function releaseReservation(reservationId: string) {
  return db.$transaction(async (tx) => {
    // 1. Lock reservation row
    const reservations = await tx.$queryRaw<Array<{ id: string, variantId: string, quantity: number, status: string }>>`
      SELECT id, "variantId", quantity, status FROM inventory_reservations
      WHERE id = ${reservationId}
      FOR UPDATE
    `
    const reservation = reservations[0]
    if (!reservation) throw new Error(`Reservation ${reservationId} not found`)

    // Only RESERVED can be released (not already committed/released)
    if (reservation.status !== "RESERVED") {
      logger.info(`[Reservation] ${reservationId} already in state ${reservation.status} — skipping release`)
      return null
    }

    // 2. Lock inventory
    const inventories = await tx.$queryRaw<Array<{ id: string, reserved: number, quantity: number }>>`
      SELECT id, reserved FROM inventory
      WHERE "variantId" = ${reservation.variantId}
      FOR UPDATE
    `
    const inv = inventories[0]
    if (!inv) throw new Error(`Inventory not found for reservation ${reservationId}`)

    // 3. Decrement reserved counter only (no quantity change — stock was never committed)
    await tx.inventory.update({
      where: { id: inv.id },
      data: {
        reserved: { decrement: Math.min(inv.reserved, reservation.quantity) },
      },
    })

    // 4. Mark reservation as released
    return tx.inventoryReservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.RELEASED,
        releasedAt: new Date(),
      },
    })
  })
}

/**
 * Release all expired RESERVED reservations.
 * Called by the inventory worker cron every 5 minutes.
 * Returns the count of released reservations.
 */
export async function releaseExpiredReservations(): Promise<number> {
  const now = new Date()

  const expired = await db.inventoryReservation.findMany({
    where: {
      status: ReservationStatus.RESERVED,
      expiresAt: { lt: now },
    },
    select: { id: true },
  })

  let released = 0
  for (const { id } of expired) {
    try {
      await releaseReservation(id)
      released++
      logger.info(`[ReservationEngine] Released expired reservation: ${id}`)
    } catch (err: unknown) {
      logger.error(`[ReservationEngine] Release failed for ${id}: ${(err as Error).message}`)
    }
  }

  return released
}

/**
 * Release all reservations for a specific checkout session.
 * Used when a checkout is explicitly abandoned or payment fails.
 */
export async function releaseCheckoutReservations(checkoutId: string): Promise<number> {
  const reservations = await db.inventoryReservation.findMany({
    where: {
      checkoutId,
      status: ReservationStatus.RESERVED,
    },
    select: { id: true },
  })

  let released = 0
  for (const { id } of reservations) {
    try {
      await releaseReservation(id)
      released++
    } catch (err: unknown) {
      logger.error(`[ReservationEngine] Release failed for ${id}: ${(err as Error).message}`)
    }
  }

  return released
}
