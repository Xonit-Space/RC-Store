import { Job } from "bullmq"
import { createWorker } from "../worker"

export const emailWorker = createWorker("email", async (job: Job) => {
  const { to, subject, html } = job.data
  console.log(`[EmailWorker] Sending email to ${to} (Subject: ${subject})`)
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return { delivered: true, timestamp: Date.now() }
})
