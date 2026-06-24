import Redis from "ioredis"

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379"
const isLocalhost = redisUrl.includes("localhost") || redisUrl.includes("127.0.0.1")
const isInvalidProdRedis = process.env.NODE_ENV === "production" && isLocalhost

// BullMQ requires maxRetriesPerRequest: null to work properly with blocking commands,
// BUT if we're in production with a dummy localhost URL, we must fail fast instead of hanging forever.
export const queueConnection = new Redis(redisUrl, { 
  maxRetriesPerRequest: isInvalidProdRedis ? 0 : null,
  enableReadyCheck: false,
  lazyConnect: true,
  connectTimeout: isInvalidProdRedis ? 1000 : 10000
})

queueConnection.on("error", (err: Error) => {
  // Suppress expected connection noise:
  // - Upstash/remote unavailable in dev
  // - Local Redis not running
  const isConnectionNoise =
    err.message.includes("ECONNREFUSED") ||
    err.message.includes("ECONNRESET") ||
    err.message.includes("MaxRetriesPerRequest")

  if (isConnectionNoise) return

  // Only log unexpected errors (auth failures, protocol errors, etc.)
  if (!isInvalidProdRedis) {
    console.error("[Queue] Redis connection error:", err.message)
  }
})
