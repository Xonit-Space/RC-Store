/**
 * Hybrid Distributed Idempotency System
 *
 * Two-layer strategy:
 * 1. Redis fast path  — O(1) lookup, SET NX for atomic claim
 * 2. DB final authority — survives Redis crashes, TTL-based cleanup
 *
 * Pattern:
 *   IF Redis key exists → return cached result
 *   ELSE
 *     SET NX key = "PROCESSING" (atomic Redis lock)
 *     IF conflict → another request owns it, wait/return
 *     Proceed with business logic
 *     Store result in Redis + DB
 *     Return result
 */

import { createHash } from "crypto"
import { redisGet, redisSet, redisDel, redisClient } from "@/services/redis"
import { db } from "@/lib/db"

const DEFAULT_TTL_SECONDS = 86400 // 24 hours
const PROCESSING_TTL_SECONDS = 300 // 5 min max lock hold

export interface IdempotencyResult<T = unknown> {
  hit: boolean           // true if retrieved from cache
  status: "PROCESSING" | "COMPLETED" | "FAILED"
  result?: T
}

/**
 * Derives a deterministic, normalized idempotency key.
 * SHA-256 of "namespace:requestId" prevents key injection.
 */
export function buildIdempotencyKey(namespace: string, requestId: string): string {
  return createHash("sha256").update(`${namespace}:${requestId}`).digest("hex")
}

/**
 * Check if a request has already been processed.
 * Returns the cached result if found (Redis fast path or DB fallback).
 */
export async function checkIdempotency<T = unknown>(
  namespace: string,
  requestId: string
): Promise<IdempotencyResult<T> | null> {
  const key = buildIdempotencyKey(namespace, requestId)
  const redisKey = `idempotency:${key}`

  // Fast path: Redis
  const cached = await redisGet<{ status: string; result?: T }>(redisKey)
  if (cached) {
    if (cached.status === "PROCESSING") {
      return { hit: true, status: "PROCESSING" }
    }
    return { hit: true, status: cached.status as IdempotencyResult["status"], result: cached.result }
  }

  // Fallback: DB (handles Redis crash scenario)
  const record = await db.idempotencyRecord.findUnique({
    where: { key },
    select: { status: true, resultJson: true, expiresAt: true },
  })

  if (record) {
    // Check if expired
    if (record.expiresAt < new Date()) {
      // Stale record — treat as miss
      await db.idempotencyRecord.delete({ where: { key } }).catch(() => {})
      return null
    }

    const result = record.resultJson ? (JSON.parse(record.resultJson) as T) : undefined
    // Backfill Redis from DB
    await redisSet(redisKey, { status: record.status, result }, DEFAULT_TTL_SECONDS)
    return { hit: true, status: record.status as IdempotencyResult["status"], result }
  }

  return null
}

/**
 * Atomically claim an idempotency key as "PROCESSING".
 * Returns true if this caller is the owner; false if another caller already claimed it.
 */
export async function claimIdempotencyKey(
  namespace: string,
  requestId: string
): Promise<boolean> {
  const key = buildIdempotencyKey(namespace, requestId)
  const redisKey = `idempotency:${key}`

  // Attempt atomic SET NX (only set if not exists)
  let claimed = false

  if (redisClient) {
    // True Redis: use SET NX EX atomic command
    const result = await redisClient.set(
      redisKey,
      JSON.stringify({ status: "PROCESSING" }),
      "EX",
      PROCESSING_TTL_SECONDS,
      "NX"
    )
    claimed = result === "OK"
  } else {
    // Memory fallback: check-then-set (not atomic but single-process safe)
    const existing = await redisGet(redisKey)
    if (!existing) {
      await redisSet(redisKey, { status: "PROCESSING" }, PROCESSING_TTL_SECONDS)
      claimed = true
    }
  }

  if (claimed) {
    // Persist to DB as the final authority record
    const expiresAt = new Date(Date.now() + DEFAULT_TTL_SECONDS * 1000)
    await db.idempotencyRecord.upsert({
      where: { key },
      create: { key, namespace, status: "PROCESSING", expiresAt },
      update: { status: "PROCESSING", expiresAt },
    })
  }

  return claimed
}

/**
 * Store the final result after successful processing.
 * Overwrites the PROCESSING state with COMPLETED.
 */
export async function completeIdempotency<T = unknown>(
  namespace: string,
  requestId: string,
  result: T,
  ttlSeconds = DEFAULT_TTL_SECONDS
): Promise<void> {
  const key = buildIdempotencyKey(namespace, requestId)
  const redisKey = `idempotency:${key}`
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000)

  await redisSet(redisKey, { status: "COMPLETED", result }, ttlSeconds)

  await db.idempotencyRecord.upsert({
    where: { key },
    create: {
      key,
      namespace,
      status: "COMPLETED",
      resultJson: JSON.stringify(result),
      expiresAt,
    },
    update: {
      status: "COMPLETED",
      resultJson: JSON.stringify(result),
      expiresAt,
    },
  })
}

/**
 * Mark idempotency key as FAILED (bad result stored, allow inspection).
 */
export async function failIdempotency(
  namespace: string,
  requestId: string,
  error: string
): Promise<void> {
  const key = buildIdempotencyKey(namespace, requestId)
  const redisKey = `idempotency:${key}`

  await redisDel(redisKey)

  await db.idempotencyRecord.upsert({
    where: { key },
    create: {
      key,
      namespace,
      status: "FAILED",
      resultJson: JSON.stringify({ error }),
      expiresAt: new Date(Date.now() + 3600 * 1000), // 1h for failed entries
    },
    update: {
      status: "FAILED",
      resultJson: JSON.stringify({ error }),
    },
  })
}
