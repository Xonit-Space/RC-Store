/**
 * Payment Reconciliation Engine
 *
 * Compares Stripe payment records vs DB payment records for a given date range.
 * Outputs a ReconciliationReport identifying:
 * - Payments in Stripe but missing in DB (lost webhook)
 * - Payments in DB but not in Stripe (orphan records)
 * - Amount mismatches (partial captures, rounding errors)
 * - Duplicate orders
 *
 * Safe strategy: NEVER re-charges. ONLY identifies gaps for manual/automated rehydration.
 */

import { db } from "@/lib/db"
import { stripe } from "@/services/stripe"
import { PaymentStatus } from "@prisma/client"

export interface ReconciliationInput {
  date?: Date // Reconcile this day. Defaults to yesterday.
}

export interface MismatchedAmount {
  orderId: string
  orderNumber: string
  stripeAmount: number
  dbAmount: number
  delta: number
}

export interface ReconciliationSummary {
  reportDate: string
  stripeTotal: number
  dbTotal: number
  delta: number
  missingInDB: string[]
  missingInStripe: string[]
  mismatchedAmounts: MismatchedAmount[]
  duplicateOrders: string[]
  status: "CLEAN" | "DISCREPANCY"
}

export async function runReconciliation(input: ReconciliationInput = {}): Promise<ReconciliationSummary> {
  // Target date = yesterday if not specified
  const targetDate = input.date ?? (() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    d.setHours(0, 0, 0, 0)
    return d
  })()

  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(targetDate)
  endOfDay.setHours(23, 59, 59, 999)

  // 1. Fetch completed DB payments for the date
  const dbPayments = await db.payment.findMany({
    where: {
      status: PaymentStatus.COMPLETED,
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      order: { select: { orderNumber: true } },
    },
  })

  const dbByTransactionId = new Map(
    dbPayments.map((p) => [p.transactionId, p])
  )

  // 2. Fetch Stripe PaymentIntents for the date range
  // Note: Stripe list is paginated; we fetch up to 100 per day (adjust limit for high-volume)
  let stripePaymentIntents: any[] = []
  try {
    const stripeList = await stripe.paymentIntents.list({
      created: {
        gte: Math.floor(startOfDay.getTime() / 1000),
        lte: Math.floor(endOfDay.getTime() / 1000),
      },
      limit: 100,
    })
    stripePaymentIntents = stripeList.data.filter((pi: any) => pi.status === "succeeded")
  } catch (err: any) {
    console.warn("[Reconciliation] Stripe API unavailable — using DB-only data:", err.message)
    // Graceful degradation: still produce partial report
  }

  const stripeByIntentId = new Map(
    stripePaymentIntents.map((pi: any) => [pi.id, pi])
  )

  // 3. Identify gaps
  const missingInDB: string[] = []
  const mismatchedAmounts: MismatchedAmount[] = []
  let stripeTotal = 0

  for (const [intentId, pi] of stripeByIntentId) {
    const stripeAmount = (pi.amount_received ?? pi.amount) / 100
    stripeTotal += stripeAmount

    const dbPayment = dbByTransactionId.get(intentId)
    if (!dbPayment) {
      missingInDB.push(intentId)
    } else {
      const delta = Math.abs(stripeAmount - dbPayment.amount)
      if (delta > 0.01) { // >1 cent tolerance
        mismatchedAmounts.push({
          orderId: dbPayment.orderId,
          orderNumber: dbPayment.order.orderNumber,
          stripeAmount,
          dbAmount: dbPayment.amount,
          delta,
        })
      }
    }
  }

  const missingInStripe: string[] = []
  let dbTotal = 0

  for (const [transactionId, payment] of dbByTransactionId) {
    dbTotal += payment.amount
    if (!stripeByIntentId.has(transactionId)) {
      missingInStripe.push(transactionId)
    }
  }

  // 4. Detect duplicate orders (same orderNumber appearing multiple times in payments)
  const orderNumbers = dbPayments.map((p) => p.order.orderNumber)
  const duplicateOrders = orderNumbers.filter(
    (n, idx) => orderNumbers.indexOf(n) !== idx
  )

  const delta = Math.abs(stripeTotal - dbTotal)
  const status: "CLEAN" | "DISCREPANCY" =
    missingInDB.length === 0 &&
    missingInStripe.length === 0 &&
    mismatchedAmounts.length === 0 &&
    duplicateOrders.length === 0
      ? "CLEAN"
      : "DISCREPANCY"

  // 5. Persist report
  const reportDate = startOfDay
  await db.reconciliationReport.upsert({
    where: { reportDate } as any,
    create: {
      reportDate,
      stripeTotal,
      dbTotal,
      delta,
      missingInDB: JSON.stringify(missingInDB),
      missingInStripe: JSON.stringify(missingInStripe),
      mismatchedAmounts: JSON.stringify(mismatchedAmounts),
      duplicateOrders: JSON.stringify(duplicateOrders),
      status,
    },
    update: {
      stripeTotal,
      dbTotal,
      delta,
      missingInDB: JSON.stringify(missingInDB),
      missingInStripe: JSON.stringify(missingInStripe),
      mismatchedAmounts: JSON.stringify(mismatchedAmounts),
      duplicateOrders: JSON.stringify(duplicateOrders),
      status,
    },
  })

  const summary: ReconciliationSummary = {
    reportDate: startOfDay.toISOString().split("T")[0],
    stripeTotal,
    dbTotal,
    delta,
    missingInDB,
    missingInStripe,
    mismatchedAmounts,
    duplicateOrders,
    status,
  }

  if (status === "DISCREPANCY") {
    console.error(`[Reconciliation] DISCREPANCY detected for ${summary.reportDate}:`, {
      missingInDB: missingInDB.length,
      missingInStripe: missingInStripe.length,
      mismatchedAmounts: mismatchedAmounts.length,
      duplicateOrders: duplicateOrders.length,
      delta,
    })
  } else {
    console.log(`[Reconciliation] CLEAN for ${summary.reportDate}. Stripe: $${stripeTotal}, DB: $${dbTotal}`)
  }

  return summary
}
