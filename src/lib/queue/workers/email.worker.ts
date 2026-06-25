import { Job } from "bullmq"
import { createWorker } from "../worker"
import { sendEmailJob } from "@/services/email-job"

export const emailWorker = createWorker("email", async (job: Job) => {
  return sendEmailJob(job.data)
})
