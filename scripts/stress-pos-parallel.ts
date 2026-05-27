/**
 * Stress Test 3: 20 Parallel POS Terminal Sales (Same Product SKU)
 *
 * Simulates 20 POS terminals concurrently processing sales on the same variant.
 * Uses the identical pessimistic FOR UPDATE lock pattern as the POS sale pipeline.
 * Verifies inventory invariant S - R - C >= 0 at the end.
 *
 * Run: npx tsx scripts/stress-pos-parallel.ts
 */

import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

const TERMINAL_COUNT = 20
const QTY_PER_SALE = 1

async function getTestVariant(): Promise<{ variantId: string; invId: string; initialQty: number }> {
  const inv = await db.inventory.findFirst({
    where: { quantity: { gt: 0 } },
    select: { id: true, variantId: true, quantity: true, reserved: true },
  })

  if (!inv) throw new Error("No inventory found. Seed data required.")

  console.log(`[POS STRESS] Variant: ${inv.variantId}`)
  console.log(`[POS STRESS] Starting qty: ${inv.quantity} | Reserved: ${inv.reserved} | Available: ${inv.quantity - inv.reserved}`)

  return { variantId: inv.variantId, invId: inv.id, initialQty: inv.quantity - inv.reserved }
}

async function simulatePosTerminalSale(
  variantId: string,
  terminalId: number
): Promise<"SUCCESS" | "FAIL_STOCK" | "FAIL_ERROR"> {
  try {
    return await db.$transaction(async (tx) => {
      // Pessimistic row lock — mirrors POS sale pipeline
      const rows = await tx.$queryRaw<any[]>`
        SELECT id, quantity, reserved FROM inventory
        WHERE "variantId" = ${variantId}
        FOR UPDATE
      `
      const inv = rows[0]
      if (!inv) return "FAIL_ERROR"

      const available = inv.quantity - inv.reserved
      if (available < QTY_PER_SALE) {
        console.log(`  [Terminal ${terminalId}] Insufficient stock — FAIL_STOCK`)
        return "FAIL_STOCK"
      }

      await tx.inventory.update({
        where: { id: inv.id },
        data: { quantity: { decrement: QTY_PER_SALE } },
      })

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inv.id,
          quantity: -QTY_PER_SALE,
          type: "SHIPMENT",
          reason: `POS stress test — terminal ${terminalId}`,
        },
      })

      console.log(`  [Terminal ${terminalId}] Sale SUCCEEDED`)
      return "SUCCESS"
    })
  } catch (err: any) {
    console.error(`  [Terminal ${terminalId}] Error: ${err.message}`)
    return "FAIL_ERROR"
  }
}

async function main() {
  console.log(`\n=== POS PARALLEL TERMINAL STRESS TEST (${TERMINAL_COUNT} terminals) ===\n`)
  const { variantId, initialQty } = await getTestVariant()

  const tasks = Array.from({ length: TERMINAL_COUNT }, (_, i) =>
    simulatePosTerminalSale(variantId, i + 1)
  )

  const results = await Promise.allSettled(tasks)

  let succeeded = 0
  let failedStock = 0
  let failedError = 0

  for (const r of results) {
    if (r.status === "fulfilled") {
      if (r.value === "SUCCESS") succeeded++
      else if (r.value === "FAIL_STOCK") failedStock++
      else failedError++
    } else {
      failedError++
    }
  }

  // Post-run inventory snapshot
  const finalInv = await db.inventory.findFirst({
    where: { variantId },
    select: { quantity: true, reserved: true },
  })
  const finalQty = finalInv?.quantity ?? -999
  const finalReserved = finalInv?.reserved ?? 0

  // Count movements created in this run
  const movementsCreated = await db.inventoryMovement.count({
    where: {
      inventory: { variantId },
      reason: { contains: "POS stress test" },
    },
  })

  console.log(`\n=== RESULTS ===`)
  console.log(`Total terminals:    ${TERMINAL_COUNT}`)
  console.log(`Succeeded:          ${succeeded}`)
  console.log(`Failed (no stock):  ${failedStock}`)
  console.log(`Failed (error):     ${failedError}`)
  console.log(`Movements logged:   ${movementsCreated}`)
  console.log(`\n=== INVARIANT CHECK (S - R >= 0) ===`)
  console.log(`Initial available:  ${initialQty}`)
  console.log(`Expected successes: <= ${initialQty}`)
  console.log(`Final qty:          ${finalQty}`)
  console.log(`Final reserved:     ${finalReserved}`)
  console.log(`Net available:      ${finalQty - finalReserved}`)

  const inventoryPositive = finalQty >= 0
  const netAvailablePositive = (finalQty - finalReserved) >= 0
  const successCapped = succeeded <= initialQty
  const movementsMatchSuccesses = movementsCreated === succeeded

  if (inventoryPositive && netAvailablePositive && successCapped && movementsMatchSuccesses) {
    console.log(`\n✅ PASS — Inventory invariant HOLDS under ${TERMINAL_COUNT} parallel POS terminals.`)
    console.log(`         Audit trail verified: ${movementsCreated} movements match ${succeeded} successes.`)
  } else {
    console.error(`\n❌ FAIL — INVARIANT VIOLATED!`)
    if (!inventoryPositive)      console.error(`   Inventory went NEGATIVE: ${finalQty}`)
    if (!netAvailablePositive)   console.error(`   Net available (qty-reserved) went NEGATIVE: ${finalQty - finalReserved}`)
    if (!successCapped)          console.error(`   Oversell: ${succeeded} successes but only ${initialQty} available`)
    if (!movementsMatchSuccesses) console.error(`   Audit mismatch: ${movementsCreated} movements vs ${succeeded} successes`)
    process.exit(1)
  }

  await db.$disconnect()
}

main().catch((e) => {
  console.error(e)
  db.$disconnect()
  process.exit(1)
})
