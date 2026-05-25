import { Job } from "bullmq"
import { createWorker } from "../worker"

export const webhookWorker = createWorker("webhook", async (job: Job) => {
  const { url, payload } = job.data
  console.log(`[WebhookWorker] Firing webhook to ${url}`)
  
  // Simulate outbound HTTP request
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // We could implement retry logic naturally via BullMQ's throw mechanism here
  return { status: 200, delivered: true }
})
