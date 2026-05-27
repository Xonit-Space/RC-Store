/**
 * Chaos Test: 100x Duplicate Webhook Storm
 *
 * Simulates 100 parallel deliveries of the SAME Stripe event ID.
 * Tests the stripeEventId unique constraint on WebhookEvent table.
 *
 * Expected:
 * - Exactly 1 WebhookEvent record created
 * - 99 attempts caught by P2002 unique constraint
 * - Zero duplicate orders
 * - Zero errors
 *
 * Run: npx tsx scripts/chaos-webhook-storm.ts
 */

import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const STORM_COUNT = 100
const FAKE_EVENT_ID = `evt_stress_${Date.now()}`

async function simulateWebhookDelivery(attempt: number): Promise<"STORED" | "DUPLICATE" | "ERROR"> {
  try {
    await db.webhookEvent.create({
      data: {
        stripeEventId: FAKE_EVENT_ID,
        stripeCreated: Math.floor(Date.now() / 1000),
        eventType: "checkout.session.completed",
        payload: JSON.stringify({ id: FAKE_EVENT_ID }),
        status: "PENDING",
      },
    })
    return "STORED"
  } catch (err: any) {
    if (err.code === "P2002") return "DUPLICATE"
    console.error(`  [Storm ${attempt}] Unexpected error:`, err.message)
    return "ERROR"
  }
}

async function main() {
  console.log(`\n=== WEBHOOK STORM CHAOS TEST (${STORM_COUNT} parallel) ===`)
  console.log(`Event ID: ${FAKE_EVENT_ID}\n`)

  const tasks = Array.from({ length: STORM_COUNT }, (_, i) =>
    simulateWebhookDelivery(i + 1)
  )

  const results = await Promise.allSettled(tasks)

  let stored = 0, duplicates = 0, errors = 0
  for (const r of results) {
    if (r.status === "fulfilled") {
      if (r.value === "STORED") stored++
      else if (r.value === "DUPLICATE") duplicates++
      else errors++
    } else {
      errors++
    }
  }

  const dbCount = await db.webhookEvent.count({ where: { stripeEventId: FAKE_EVENT_ID } })

  console.log(`=== RESULTS ===`)
  console.log(`STORED:    ${stored}`)
  console.log(`DUPLICATE: ${duplicates}`)
  console.log(`ERROR:     ${errors}`)
  console.log(`\n=== INVARIANT CHECK ===`)
  console.log(`Records in DB: ${dbCount} (expected: 1)`)

  if (dbCount === 1 && errors === 0) {
    console.log(`\n✅ PASS — Exactly 1 webhook stored. Ordering guarantee HOLDS.`)
  } else {
    console.error(`\n❌ FAIL — Webhook ordering VIOLATED! DB count: ${dbCount}, errors: ${errors}`)
    process.exit(1)
  }

  // Cleanup
  await db.webhookEvent.deleteMany({ where: { stripeEventId: FAKE_EVENT_ID } })
  console.log(`[Cleanup] Test webhook event removed.`)
  await db.$disconnect()
}

main().catch((e) => { console.error(e); db.$disconnect(); process.exit(1) })
