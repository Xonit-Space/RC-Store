import { Job } from "bullmq"
import { createWorker } from "../worker"

export const analyticsWorker = createWorker("analytics", async (job: Job) => {
  const { event, userId, payload } = job.data
  console.log(`[AnalyticsWorker] Processing event ${event} for user ${userId}`)
  
  // Simulate heavy aggregation workload
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return { processed: true, event }
})
