import { analyticsQueue, inventoryQueue } from "./queues"

/**
 * Initializes all repeatable background cron jobs on the BullMQ queue system.
 */
export async function initializeScheduledJobs(): Promise<void> {
  // 1. Daily Analytics Aggregation at Midnight
  await analyticsQueue.add(
    "daily_summary",
    { event: "SYSTEM_DAILY_SUMMARY", payload: {} },
    {
      repeat: {
        pattern: "0 0 * * *", // Midnight every day
      },
      jobId: "daily_analytics_summary_job"
    }
  )

  // 2. Hourly Inventory Integrity Check
  await inventoryQueue.add(
    "inventory_sync",
    { action: "SYNC", payload: {} },
    {
      repeat: {
        pattern: "0 * * * *", // Top of every hour
      },
      jobId: "hourly_inventory_sync_job"
    }
  )
}
