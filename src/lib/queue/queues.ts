import { Queue, DefaultJobOptions } from "bullmq"
import { getQueueConnection, isQueueEnabled } from "./connection"

const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: 100,
}

const queueCache = new Map<string, Queue>()

function getOrCreateQueue(name: string): Queue {
  if (!isQueueEnabled) {
    throw new Error(`[Queue] "${name}" unavailable — REDIS_URL not configured for this runtime`)
  }

  let queue = queueCache.get(name)
  if (!queue) {
    queue = new Queue(name, {
      connection: getQueueConnection() as any,
      defaultJobOptions,
    })
    queueCache.set(name, queue)
  }
  return queue
}

/** Lazy queue proxy — defers Redis connection until first use (safe on Vercel without Redis). */
function lazyQueue(name: string): Queue {
  return new Proxy({} as Queue, {
    get(_target, prop) {
      const queue = getOrCreateQueue(name)
      const value = Reflect.get(queue, prop, queue)
      return typeof value === "function" ? value.bind(queue) : value
    },
  })
}

export const emailQueue = lazyQueue("email")
export const analyticsQueue = lazyQueue("analytics")
export const inventoryQueue = lazyQueue("inventory")
export const webhookQueue = lazyQueue("webhook")
export const dlqQueue = lazyQueue("dlq")
