import Redis from "ioredis"

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379"

// BullMQ requires maxRetriesPerRequest: null to work properly with blocking commands
export const queueConnection = new Redis(redisUrl, { 
  maxRetriesPerRequest: null,
  enableReadyCheck: false
})

queueConnection.on("error", (err) => {
  console.error("Queue Redis connection error:", err)
})
