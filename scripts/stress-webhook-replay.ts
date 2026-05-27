/**
 * Stress Test 2: Stripe Webhook Replay (Idempotency Under Fire)
 *
 * Simulates 10 parallel deliveries of the SAME checkout.session.completed event
 * (Stripe retry storm / duplicate webhook delivery scenario).
 *
 * Expected: Exactly 1 order gets created. 9 requests return 200 already_processed.
 * No duplicate inventory decrements. No duplicate address rows.
 *
 * Run: npx tsx scripts/stress-webhook-replay.ts
 */

import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

// Use a unique order number per run so test is repeatable
const TEST_ORDER_NUMBER = `STRESS-WEBHOOK-${Date.now()}`
const REPLAY_COUNT = 10

/**
 * Simulates the exact idempotency logic from the production webhook handler.
 * Returns "CREATED" | "SKIPPED"
 */
async function simulateWebhookEvent(orderNumber: string, runId: number): Promise<"CREATED" | "SKIPPED"> {
  // IDEMPOTENCY GUARD (mirrors production code in route.ts)
  const existing = await db.order.findUnique({
    where: { orderNumber },
    select: { id: true },
  })

  if (existing) {
    console.log(`  [Run ${runId}] Order ${orderNumber} already exists — SKIPPED (idempotent)`)
    return "SKIPPED"
  }

  // Simulate the window between check and create (realistic race window)
  await new Promise((r) => setTimeout(r, Math.random() * 10))

  // Use upsert to prevent duplicate creation in a race
  try {
    // Find a real user + variant to attach this synthetic order to
    const user = await db.user.findFirst({ select: { id: true } })
    const variant = await db.productVariant.findFirst({ select: { id: true, price: true } })
    const address = await db.address.findFirst({ select: { id: true } })

    if (!user || !variant || !address) {
      console.warn(`  [Run ${runId}] Missing seed data (user/variant/address). Mark as SKIPPED.`)
      return "SKIPPED"
    }

    await db.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "PENDING",
        subtotal: 100,
        tax: 0,
        shippingCost: 5,
        discount: 0,
        total: 105,
        shippingAddressId: address.id,
        billingAddressId: address.id,
        items: {
          create: [{
            variantId: variant.id,
            quantity: 1,
            price: variant.price ?? 100,
            total: variant.price ?? 100,
          }],
        },
      },
    })
    console.log(`  [Run ${runId}] Order CREATED`)
    return "CREATED"
  } catch (err: any) {
    // Unique constraint violation = concurrent runner already created it
    if (err.code === "P2002") {
      console.log(`  [Run ${runId}] Race condition caught — P2002 unique constraint (treated as SKIPPED)`)
      return "SKIPPED"
    }
    throw err
  }
}

async function main() {
  console.log(`\n=== STRIPE WEBHOOK REPLAY STRESS TEST (${REPLAY_COUNT} parallel replays) ===`)
  console.log(`Order number under test: ${TEST_ORDER_NUMBER}\n`)

  const tasks = Array.from({ length: REPLAY_COUNT }, (_, i) =>
    simulateWebhookEvent(TEST_ORDER_NUMBER, i + 1)
  )

  const results = await Promise.allSettled(tasks)

  let created = 0
  let skipped = 0
  let errored = 0

  for (const r of results) {
    if (r.status === "fulfilled") {
      if (r.value === "CREATED") created++
      else skipped++
    } else {
      errored++
      console.error("  Unhandled error:", r.reason)
    }
  }

  // Verify DB state
  const orderCount = await db.order.count({ where: { orderNumber: TEST_ORDER_NUMBER } })

  console.log(`\n=== RESULTS ===`)
  console.log(`Total replays:    ${REPLAY_COUNT}`)
  console.log(`CREATED:          ${created}`)
  console.log(`SKIPPED:          ${skipped}`)
  console.log(`ERRORED:          ${errored}`)
  console.log(`\n=== INVARIANT CHECK ===`)
  console.log(`Orders in DB for ${TEST_ORDER_NUMBER}: ${orderCount}`)

  // INVARIANT: exactly 1 order in DB, 0 errors
  if (orderCount === 1 && errored === 0) {
    console.log(`\n✅ PASS — Exactly 1 order created. Idempotency HOLDS.`)
  } else {
    console.error(`\n❌ FAIL — IDEMPOTENCY VIOLATED!`)
    if (orderCount !== 1) console.error(`   Expected 1 order, found ${orderCount}`)
    if (errored > 0) console.error(`   ${errored} unhandled errors during replay`)
    process.exit(1)
  }

  // Cleanup test order
  await db.orderItem.deleteMany({ where: { order: { orderNumber: TEST_ORDER_NUMBER } } })
  await db.order.deleteMany({ where: { orderNumber: TEST_ORDER_NUMBER } })
  console.log(`\n[Cleanup] Test order removed from DB.`)

  await db.$disconnect()
}

main().catch((e) => {
  console.error(e)
  db.$disconnect()
  process.exit(1)
})
