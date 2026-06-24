import Redis from "ioredis"

const redisUrl = process.env.REDIS_URL

export let redisClient: Redis | null = null
let redisPub: Redis | null = null
let redisSub: Redis | null = null

// Shared options: disable offline queue so commands fail immediately instead of
// piling up and spamming retries when Redis is unreachable.
const BASE_OPTIONS = {
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  lazyConnect: true,
  connectTimeout: 5000,
}

function attachErrorHandler(client: Redis, label: string) {
  client.on("error", (err: Error) => {
    // Only log once per type of error to avoid console flooding.
    // ECONNREFUSED / MaxRetriesPerRequestError are expected when Redis is down.
    if (
      err.message.includes("ECONNREFUSED") ||
      err.message.includes("ECONNRESET") ||
      err.message.includes("MaxRetriesPerRequest")
    ) {
      // Downgrade to a single-line warning — already shown on startup.
      return
    }
    console.error(`[Redis:${label}] Unexpected error:`, err.message)
  })
}

// Initialize ioredis clients if host target URL is defined in env parameters
if (redisUrl) {
  try {
    redisClient = new Redis(redisUrl, BASE_OPTIONS)
    redisPub = new Redis(redisUrl, BASE_OPTIONS)
    redisSub = new Redis(redisUrl, BASE_OPTIONS)

    attachErrorHandler(redisClient, "client")
    attachErrorHandler(redisPub, "pub")
    attachErrorHandler(redisSub, "sub")

    // Attempt connection and warn once on failure
    redisClient.connect().catch(() => {
      console.warn("[Redis] Could not connect to Redis — falling back to in-memory cache.")
      redisClient = null
      redisPub = null
      redisSub = null
    })
  } catch (err) {
    console.warn("[Redis] Failed to initialize Redis clients — falling back to in-memory cache.")
  }
}

// ==========================================
// HIGH-PERFORMANCE MOCK MEMORY FALLBACK
// ==========================================

type CacheItem<T> = {
  value: T
  expiresAt: number
}

class MemoryRedisMock {
  private cache = new Map<string, CacheItem<unknown>>()
  private subscribers = new Map<string, Array<(message: string) => void>>()

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return typeof item.value === "string" ? item.value : JSON.stringify(item.value)
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<string> {
    let ttlMs = 30 * 24 * 60 * 60 * 1000 // 30 days default
    if (mode === "EX" && duration) {
      ttlMs = duration * 1000
    }
    
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
    return "OK"
  }

  async del(key: string): Promise<number> {
    const deleted = this.cache.delete(key) ? 1 : 0
    return deleted
  }

  async publish(channel: string, message: string): Promise<number> {
    const subs = this.subscribers.get(channel) || []
    subs.forEach((cb) => {
      try {
        cb(message)
      } catch (err) {
        console.error("Local pub/sub dispatch failure:", err)
      }
    })
    return subs.length
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const subs = this.subscribers.get(channel) || []
    this.subscribers.set(channel, [...subs, callback])
  }
}

const localMemoryMock = new MemoryRedisMock()

// ==========================================
// PUBLIC CACHE & PUB/SUB WRAPPERS
// ==========================================

export async function redisSet<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  const stringValue = typeof value === "string" ? value : JSON.stringify(value)
  
  if (redisClient) {
    if (ttlSeconds) {
      await redisClient.set(key, stringValue, "EX", ttlSeconds)
    } else {
      await redisClient.set(key, stringValue)
    }
  } else {
    await localMemoryMock.set(key, stringValue, ttlSeconds ? "EX" : undefined, ttlSeconds)
  }
}

export async function redisGet<T>(key: string): Promise<T | null> {
  let valueStr: string | null = null

  if (redisClient) {
    valueStr = await redisClient.get(key)
  } else {
    valueStr = await localMemoryMock.get(key)
  }

  if (!valueStr) return null

  try {
    return JSON.parse(valueStr) as T
  } catch {
    return valueStr as unknown as T
  }
}

export async function redisDel(key: string): Promise<void> {
  if (redisClient) {
    await redisClient.del(key)
  } else {
    await localMemoryMock.del(key)
  }
}

export async function redisPublish(channel: string, message: unknown): Promise<number> {
  const payload = typeof message === "string" ? message : JSON.stringify(message)
  
  if (redisPub) {
    return redisPub.publish(channel, payload)
  } else {
    return localMemoryMock.publish(channel, payload)
  }
}

export async function redisSubscribe(channel: string, callback: (message: string) => void): Promise<void> {
  if (redisSub) {
    await redisSub.subscribe(channel)
    redisSub.on("message", (subChannel, message) => {
      if (subChannel === channel) {
        callback(message)
      }
    })
  } else {
    await localMemoryMock.subscribe(channel, callback)
  }
}
