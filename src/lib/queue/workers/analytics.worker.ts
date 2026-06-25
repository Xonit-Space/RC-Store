import { Job } from "bullmq"
import { createWorker } from "../worker"
import { logger } from "@/lib/logger"

export const analyticsWorker = createWorker("analytics", async (job: Job) => {
  const { event, userId, payload } = job.data
  logger.info(`[AnalyticsWorker] Processing event ${event} for user ${userId}`)
  
  // Simulate heavy aggregation workload
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return { processed: true, event }
})
