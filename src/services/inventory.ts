import { db } from "@/lib/db"
import { InventoryMovementType } from "@prisma/client"

export interface ReserveStockInput {
  variantId: string
  quantity: number
}

/**
 * Enterprise Stock Reservation Manager:
 * Manages atomic inventory locks during dynamic checkouts to prevent overselling.
 */
export async function reserveStock(input: ReserveStockInput) {
  const { variantId, quantity } = input

  return db.$transaction(async (tx) => {
    // Pessimistic Lock: SELECT FOR UPDATE
    const inventories = await tx.$queryRaw<any[]>`
      SELECT id, quantity, reserved FROM inventory
      WHERE "variantId" = ${variantId}
      FOR UPDATE
    `
    const inventory = inventories[0]

    if (!inventory) {
      throw new Error(`Variant inventory records not found for variantId ${variantId}`)
    }

    const availableStock = inventory.quantity - inventory.reserved
    if (availableStock < quantity) {
      throw new Error(`Requested stock size is currently unavailable. Requested: ${quantity}, Available: ${availableStock}`)
    }

    // Allocate reservation lock
    return tx.inventory.update({
      where: { id: inventory.id },
      data: {
        reserved: { increment: quantity },
      },
    })
  })
}

export async function releaseStock(variantId: string, quantity: number) {
  return db.$transaction(async (tx) => {
    // Pessimistic Lock: SELECT FOR UPDATE
    const inventories = await tx.$queryRaw<any[]>`
      SELECT id, quantity, reserved FROM inventory
      WHERE "variantId" = ${variantId}
      FOR UPDATE
    `
    const inventory = inventories[0]
    if (!inventory) throw new Error(`Inventory records not found for variantId ${variantId}`)

    const reservedCount = Math.max(0, inventory.reserved - quantity)

    return tx.inventory.update({
      where: { id: inventory.id },
      data: {
        reserved: reservedCount,
      },
    })
  })
}

export async function commitStock(variantId: string, quantity: number, userId?: string) {
  return db.$transaction(async (tx) => {
    // Pessimistic Lock: SELECT FOR UPDATE
    const inventories = await tx.$queryRaw<any[]>`
      SELECT id, quantity, reserved FROM inventory
      WHERE "variantId" = ${variantId}
      FOR UPDATE
    `
    const inventory = inventories[0]
    if (!inventory) throw new Error(`Inventory records not found for variantId ${variantId}`)

    const reservedCount = Math.max(0, inventory.reserved - quantity)
    const quantityCount = Math.max(0, inventory.quantity - quantity)

    const updatedInventory = await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: quantityCount,
        reserved: reservedCount,
      },
    })

    // Log the inventory transaction in movements for back-office audit tracing
    await tx.inventoryMovement.create({
      data: {
        inventoryId: updatedInventory.id,
        quantity: -quantity,
        type: InventoryMovementType.SHIPMENT,
        userId,
        reason: `Checkout order shipment deductions`,
      },
    })

    return updatedInventory
  })
}

export async function addStock(variantId: string, quantity: number, userId?: string, reason?: string) {
  return db.$transaction(async (tx) => {
    // Pessimistic Lock: SELECT FOR UPDATE
    const inventories = await tx.$queryRaw<any[]>`
      SELECT id, quantity, reserved FROM inventory
      WHERE "variantId" = ${variantId}
      FOR UPDATE
    `
    const inventory = inventories[0]
    if (!inventory) throw new Error(`Inventory records not found for variantId ${variantId}`)

    const updated = await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: { increment: quantity },
      },
    })

    await tx.inventoryMovement.create({
      data: {
        inventoryId: updated.id,
        quantity,
        type: InventoryMovementType.STOCK_IN,
        userId,
        reason: reason || "Manual catalog replenishment",
      },
    })

    return updated
  })
}
