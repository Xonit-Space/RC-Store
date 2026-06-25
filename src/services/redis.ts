import Redis from "ioredis"

const redisUrl = process.env.REDIS_URL

export let redisClient: Redis | null = null
let redisPub: Redis | null = null
let redisSub: Redis | null = null

let redisReadyPromise: Promise<boolean> | null = null

const BASE_OPTIONS = {
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  lazyConnect: true,
  connectTimeout: 5000,
}

function attachErrorHandler(client: Redis, label: string) {
  client.on("error", (err: Error) => {
    if (
      err.message.includes("ECONNREFUSED") ||
      err.message.includes("ECONNRESET") ||
      err.message.includes("MaxRetriesPerRequest")
    ) {
      return
    }
    console.error(`[Redis:${label}] Unexpected error:`, err.message)
  })
}

function createRedisClients(): void {
  if (!redisUrl || redisClient) return

  try {
    redisClient = new Redis(redisUrl, BASE_OPTIONS)
    redisPub = new Redis(redisUrl, BASE_OPTIONS)
    redisSub = new Redis(redisUrl, BASE_OPTIONS)

    attachErrorHandler(redisClient, "client")
    attachErrorHandler(redisPub, "pub")
    attachErrorHandler(redisSub, "sub")
  } catch {
    console.warn("[Redis] Failed to initialize Redis clients — falling back to in-memory cache.")
    redisClient = null
    redisPub = null
    redisSub = null
  }
}

function tearDownRedisClients(): void {
  redisClient = null
  redisPub = null
  redisSub = null
}

/**
 * Await a single Redis connection attempt. Returns true when pub/sub clients are usable.
 */
export async function ensureRedisReady(): Promise<boolean> {
  if (!redisUrl) return false

  if (!redisReadyPromise) {
    redisReadyPromise = (async () => {
      createRedisClients()
      if (!redisClient || !redisPub || !redisSub) return false

      try {
        await Promise.all([
          redisClient.connect(),
          redisPub.connect(),
          redisSub.connect(),
        ])
        return true
      } catch {
        console.warn("[Redis] Could not connect to Redis — falling back to in-memory cache.")
        tearDownRedisClients()
        return false
      }
    })()
  }

  return redisReadyPromise
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
    let ttlMs = 30 * 24 * 60 * 60 * 1000
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
    return this.cache.delete(key) ? 1 : 0
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
  const ready = await ensureRedisReady()

  if (ready && redisClient) {
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
  const ready = await ensureRedisReady()
  let valueStr: string | null = null

  if (ready && redisClient) {
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
  const ready = await ensureRedisReady()

  if (ready && redisClient) {
    await redisClient.del(key)
  } else {
    await localMemoryMock.del(key)
  }
}

/** Atomic SET if not exists — used for idempotency locks. Returns true when the key was set. */
export async function redisSetNx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
  const ready = await ensureRedisReady()

  if (ready && redisClient) {
    const result = await redisClient.set(key, value, "EX", ttlSeconds, "NX")
    return result === "OK"
  }

  const existing = await localMemoryMock.get(key)
  if (existing) return false
  await localMemoryMock.set(key, value, "EX", ttlSeconds)
  return true
}

export async function redisPublish(channel: string, message: unknown): Promise<number> {
  const payload = typeof message === "string" ? message : JSON.stringify(message)
  const ready = await ensureRedisReady()

  if (ready && redisPub) {
    return redisPub.publish(channel, payload)
  }

  return localMemoryMock.publish(channel, payload)
}

export async function redisSubscribe(
  channel: string,
  callback: (message: string) => void
): Promise<void> {
  const ready = await ensureRedisReady()

  if (ready && redisSub) {
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
