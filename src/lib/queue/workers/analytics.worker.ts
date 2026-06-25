import { Job } from "bullmq"
import { createWorker } from "../worker"
import { trackAnalyticsJob } from "@/services/analytics-job"

export const analyticsWorker = createWorker("analytics", async (job: Job) => {
  return trackAnalyticsJob(job.data)
})
