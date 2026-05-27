/**
 * Chaos Test: Reservation Expiry Under Crash Simulation
 *
 * Simulates:
 * 1. 20 checkout sessions each reserving stock (RESERVED state)
 * 2. Half of them "crash" mid-payment (simulate payment failure)
 * 3. Expiry sweep runs
 * 4. Verifies all expired reservations are RELEASED and stock restored
 *
 * Invariant: S - R >= 0 must hold after every phase
 *
 * Run: npx tsx scripts/chaos-reservation-expiry.ts
 */

import { PrismaClient, ReservationStatus } from "@prisma/client"
import { createReservation, commitReservation, releaseExpiredReservations } from "../src/services/reservation"

const db = new PrismaClient()
const SESSIONS = 20
const HALF = Math.floor(SESSIONS / 2)

async function getTestVariant() {
  const inv = await db.inventory.findFirst({
    where: { quantity: { gte: SESSIONS * 2 } },
    select: { id: true, variantId: true, quantity: true, reserved: true },
  })
  if (!inv) throw new Error("Need a variant with at least 40 stock for this test. Check seed data.")
  return inv
}

async function main() {
  console.log(`\n=== RESERVATION EXPIRY CHAOS TEST (${SESSIONS} sessions, ${HALF} crash) ===\n`)
  const inv = await getTestVariant()
  console.log(`Variant: ${inv.variantId} | Stock: ${inv.quantity} | Reserved: ${inv.reserved}`)
  const initialAvailable = inv.quantity - inv.reserved

  // Phase 1: Create SESSIONS reservations with a 1-second TTL (to expire quickly)
  const reservationIds: string[] = []
  const commitIds: string[] = []

  for (let i = 0; i < SESSIONS; i++) {
    try {
      const reservation = await createReservation({
        variantId: inv.variantId,
        quantity: 1,
        checkoutId: `chaos-session-${Date.now()}-${i}`,
        ttlMinutes: 1 / 60, // ~1 second TTL
      })
      reservationIds.push(reservation.id)
      if (i < HALF) commitIds.push(reservation.id)
    } catch (err: any) {
      console.error(`  Failed to create reservation ${i}:`, err.message)
    }
  }

  console.log(`\n[Phase 1] Created ${reservationIds.length} reservations.`)

  // Snapshot reserved counter after reservations
  const afterReserve = await db.inventory.findFirst({ where: { variantId: inv.variantId } })
  console.log(`  Reserved counter after: ${afterReserve?.reserved}`)

  // Phase 2: Commit the first HALF (simulates successful payment)
  let committed = 0
  for (const id of commitIds) {
    try {
      await commitReservation(id)
      committed++
    } catch (err: any) {
      console.log(`  Commit skipped (${id}): ${err.message}`)
    }
  }
  console.log(`\n[Phase 2] Committed ${committed} reservations.`)

  // Phase 3: Wait for TTL expiry (2 seconds)
  console.log(`\n[Phase 3] Waiting 2s for TTL expiry...`)
  await new Promise(r => setTimeout(r, 2000))

  // Phase 4: Run the expiry sweep (mimics the cron job)
  const releasedCount = await releaseExpiredReservations()
  console.log(`\n[Phase 4] Expiry sweep released ${releasedCount} reservations.`)

  // Phase 5: Verify invariants
  const finalInv = await db.inventory.findFirst({ where: { variantId: inv.variantId } })
  const finalQty = finalInv?.quantity ?? -999
  const finalReserved = finalInv?.reserved ?? 999
  const finalAvailable = finalQty - finalReserved

  const committedReservations = await db.inventoryReservation.count({
    where: { variantId: inv.variantId, status: ReservationStatus.COMMITTED },
  })
  const releasedReservations = await db.inventoryReservation.count({
    where: { variantId: inv.variantId, status: ReservationStatus.RELEASED },
  })

  console.log(`\n=== INVARIANT CHECK ===`)
  console.log(`Initial available:       ${initialAvailable}`)
  console.log(`Final qty:               ${finalQty}`)
  console.log(`Final reserved:          ${finalReserved}`)
  console.log(`Final available (S-R):   ${finalAvailable}`)
  console.log(`COMMITTED reservations:  ${committedReservations}`)
  console.log(`RELEASED reservations:   ${releasedReservations}`)

  const stockPositive = finalQty >= 0
  const reservedPositive = finalReserved >= 0
  const netAvailablePositive = finalAvailable >= 0
  const noStuckReservations = finalReserved === 0 // All should be either committed or released

  if (stockPositive && reservedPositive && netAvailablePositive && noStuckReservations) {
    console.log(`\n✅ PASS — All invariants hold. Expiry sweep correctly cleaned up crashed sessions.`)
    console.log(`         ${committed} committed, ${releasedCount} released by sweep. Reserved counter = 0.`)
  } else {
    console.error(`\n❌ FAIL — INVARIANT VIOLATED!`)
    if (!stockPositive) console.error(`   Stock went NEGATIVE: ${finalQty}`)
    if (!reservedPositive) console.error(`   Reserved counter NEGATIVE: ${finalReserved}`)
    if (!netAvailablePositive) console.error(`   Net available NEGATIVE: ${finalAvailable}`)
    if (!noStuckReservations) console.error(`   Stuck reservations: reserved counter is ${finalReserved} (expected 0)`)
    process.exit(1)
  }

  await db.$disconnect()
}

main().catch((e) => { console.error(e); db.$disconnect(); process.exit(1) })
