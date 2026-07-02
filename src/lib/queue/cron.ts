import { analyticsQueue, inventoryQueue, dlqQueue, emailQueue } from "./queues"

/**
 * Initializes all repeatable background cron jobs on the BullMQ queue system.
 */
export async function initializeScheduledJobs(): Promise<void> {
  // 1. Daily Analytics Aggregation at Midnight
  await analyticsQueue.add(
    "daily_summary",
    { event: "SYSTEM_DAILY_SUMMARY", payload: {} },
    {
      repeat: { pattern: "0 0 * * *" },
      jobId: "daily_analytics_summary_job"
    }
  )

  // 2. Hourly Inventory Integrity Check
  await inventoryQueue.add(
    "inventory_sync",
    { action: "SYNC", payload: {} },
    {
      repeat: { pattern: "0 * * * *" },
      jobId: "hourly_inventory_sync_job"
    }
  )

  // 3. Reservation Expiry Sweep — every 5 minutes
  await inventoryQueue.add(
    "reservation_expiry_sweep",
    { action: "EXPIRE_RESERVATIONS" },
    {
      repeat: { pattern: "*/5 * * * *" },
      jobId: "reservation_expiry_sweep_job"
    }
  )

  // 4. DLQ Processing — every 10 minutes
  await dlqQueue.add(
    "dlq_batch",
    { action: "PROCESS_DLQ_BATCH" },
    {
      repeat: { pattern: "*/10 * * * *" },
      jobId: "dlq_batch_processing_job"
    }
  )

  // 5. Nightly Payment Reconciliation — 2am
  await analyticsQueue.add(
    "payment_reconciliation",
    { action: "RECONCILE_PAYMENTS", date: null }, // null = yesterday
    {
      repeat: { pattern: "0 2 * * *" },
      jobId: "nightly_payment_reconciliation_job"
    }
  )

  // 6. Abandoned Cart Recovery — every hour
  // Sweeps carts last updated >1hr ago; fires recovery emails via Brevo SMTP
  await emailQueue.add(
    "abandoned_cart_sweep",
    { action: "ABANDONED_CART_SWEEP" },
    {
      repeat: { pattern: "0 * * * *" },
      jobId: "abandoned_cart_recovery_job"
    }
  )
}

