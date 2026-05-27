/**
 * Stress Test 1: 100 Parallel Checkout Attempts on Same Product SKU
 *
 * Simulates 100 users concurrently trying to buy the same variant at qty=1.
 * Only as many as the available stock should succeed.
 * Inventory quantity must NEVER go negative post-run.
 *
 * Run: npx tsx scripts/stress-concurrent-checkout.ts
 */

import { PrismaClient, OrderStatus } from "@prisma/client"

const db = new PrismaClient()

const CONCURRENCY = 100
const QTY_PER_ORDER = 1

async function getOrSeedTestVariant(): Promise<{ variantId: string; initialStock: number }> {
  // Pick first variant with inventory
  const inv = await db.inventory.findFirst({
    where: { quantity: { gt: 0 } },
    select: { id: true, variantId: true, quantity: true, reserved: true },
  })

  if (!inv) {
    throw new Error("No inventory records found. Seed the database first.")
  }

  const available = inv.quantity - inv.reserved
  console.log(`[STRESS] Target variant: ${inv.variantId}`)
  console.log(`[STRESS] Stock: ${inv.quantity} | Reserved: ${inv.reserved} | Available: ${available}`)
  return { variantId: inv.variantId, initialStock: available }
}

async function attemptAtomicPurchase(variantId: string, attempt: number): Promise<"SUCCESS" | "FAIL_STOCK" | "FAIL_ERROR"> {
  try {
    return await db.$transaction(async (tx) => {
      // Pessimistic lock — same as production createOrder
      const rows = await tx.$queryRaw<any[]>`
        SELECT id, quantity, reserved FROM inventory
        WHERE "variantId" = ${variantId}
        FOR UPDATE
      `
      const inv = rows[0]
      if (!inv) return "FAIL_ERROR"

      const available = inv.quantity - inv.reserved
      if (available < QTY_PER_ORDER) {
        return "FAIL_STOCK"
      }

      await tx.inventory.update({
        where: { id: inv.id },
        data: {
          quantity: { decrement: QTY_PER_ORDER },
          reserved: { decrement: Math.min(inv.reserved, QTY_PER_ORDER) },
        },
      })

      return "SUCCESS"
    })
  } catch (err: any) {
    console.error(`[STRESS] Attempt ${attempt} error: ${err.message}`)
    return "FAIL_ERROR"
  }
}

async function main() {
  console.log(`\n=== CONCURRENT CHECKOUT STRESS TEST (${CONCURRENCY} parallel) ===\n`)
  const { variantId, initialStock } = await getOrSeedTestVariant()

  const tasks = Array.from({ length: CONCURRENCY }, (_, i) =>
    attemptAtomicPurchase(variantId, i + 1)
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

  // Post-run inventory check
  const finalInv = await db.inventory.findFirst({
    where: { variantId },
    select: { quantity: true, reserved: true },
  })

  const finalQty = finalInv?.quantity ?? -999

  console.log(`\n=== RESULTS ===`)
  console.log(`Total attempts:   ${CONCURRENCY}`)
  console.log(`Succeeded:        ${succeeded}`)
  console.log(`Failed (no stock):${failedStock}`)
  console.log(`Failed (error):   ${failedError}`)
  console.log(`\n=== INVARIANT CHECK ===`)
  console.log(`Initial available stock: ${initialStock}`)
  console.log(`Expected max successes:  ${initialStock}`)
  console.log(`Final inventory qty:     ${finalQty}`)

  // INVARIANT: succeeded <= initialStock AND finalQty >= 0
  const inventoryCorrect = finalQty >= 0
  const successCapped = succeeded <= initialStock

  if (inventoryCorrect && successCapped) {
    console.log(`\n✅ PASS — Inventory invariant HOLDS. No oversell detected.`)
  } else {
    console.error(`\n❌ FAIL — INVARIANT VIOLATED!`)
    if (!inventoryCorrect) console.error(`   Inventory went NEGATIVE: ${finalQty}`)
    if (!successCapped) console.error(`   Oversell: ${succeeded} succeeded but only ${initialStock} were available`)
    process.exit(1)
  }

  await db.$disconnect()
}

main().catch((e) => {
  console.error(e)
  db.$disconnect()
  process.exit(1)
})
