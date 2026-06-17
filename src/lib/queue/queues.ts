import { Queue, DefaultJobOptions } from "bullmq"
import { queueConnection } from "./connection"

// Default policies for robust queue retries and worker execution
const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000, // Wait 1s, then 2s, then 4s, etc...
  },
  removeOnComplete: true, // Keep Redis clean
  removeOnFail: 100, // Keep last 100 failed jobs for inspection
}

export const emailQueue = new Queue("email", { connection: queueConnection as any, defaultJobOptions })
export const analyticsQueue = new Queue("analytics", { connection: queueConnection as any, defaultJobOptions })
export const inventoryQueue = new Queue("inventory", { connection: queueConnection as any, defaultJobOptions })
export const webhookQueue = new Queue("webhook", { connection: queueConnection as any, defaultJobOptions })
export const dlqQueue = new Queue("dlq", { connection: queueConnection as any, defaultJobOptions })
