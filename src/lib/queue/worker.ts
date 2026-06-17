import { Worker, Processor, WorkerOptions } from "bullmq"
import { queueConnection } from "./connection"

/**
 * Creates a BullMQ Worker attached to the standard Redis connection
 * with unified error and completion handling.
 */
export function createWorker<T, R>(
  queueName: string, 
  processor: Processor<T, R>, 
  options?: Omit<WorkerOptions, "connection">
): Worker<T, R> {
  const worker = new Worker<T, R>(queueName, processor, {
    connection: queueConnection as any,
    ...options,
  })

  worker.on("failed", (job, err) => {
    console.error(`[BullMQ] Job ${job?.id} in queue ${queueName} failed:`, err)
  })

  worker.on("completed", (job) => {
    console.log(`[BullMQ] Job ${job.id} in queue ${queueName} completed successfully.`)
  })

  return worker
}
