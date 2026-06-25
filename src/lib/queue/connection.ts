import Redis from "ioredis"
import { isServerless } from "@/lib/runtime"

const redisUrl = process.env.REDIS_URL?.trim()
const isLocalhost =
  !!redisUrl &&
  (redisUrl.includes("localhost") || redisUrl.includes("127.0.0.1"))
const isInvalidProdRedis = process.env.NODE_ENV === "production" && isLocalhost

/** BullMQ requires a real Redis URL; skip on serverless when unset or when pointing at localhost in prod. */
export const isQueueEnabled = !!redisUrl && !isInvalidProdRedis

let queueConnection: Redis | null = null

export function getQueueConnection(): Redis {
  if (!isQueueEnabled) {
    throw new Error("[Queue] BullMQ is disabled — configure REDIS_URL for long-running deployments")
  }

  if (!queueConnection) {
    queueConnection = new Redis(redisUrl!, {
      maxRetriesPerRequest: isInvalidProdRedis ? 0 : null,
      enableReadyCheck: false,
      lazyConnect: true,
      connectTimeout: isInvalidProdRedis ? 1000 : 10000,
    })

    queueConnection.on("error", (err: Error) => {
      const isConnectionNoise =
        err.message.includes("ECONNREFUSED") ||
        err.message.includes("ECONNRESET") ||
        err.message.includes("MaxRetriesPerRequest")

      if (isConnectionNoise || isInvalidProdRedis) return
      console.error("[Queue] Redis connection error:", err.message)
    })
  }

  return queueConnection
}
