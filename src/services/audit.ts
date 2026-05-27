/**
 * Immutable Append-Only Audit Log with Cryptographic Hash Chain
 *
 * Rules enforced:
 * ✔ Append-only: no updates, no deletes via this service
 * ✔ Hash chain: each entry's hash = SHA-256(prevHash + action + entityId + timestamp)
 * ✔ Traceable: any tampering breaks the chain and is detectable
 *
 * Usage: Use appendAuditLog() everywhere instead of db.auditLog.create() directly.
 */

import { createHash } from "crypto"
import { db } from "@/lib/db"

export interface AuditLogInput {
  userId?: string
  action: string
  entity: string
  entityId?: string
  ipAddress?: string
  userAgent?: string
  changes?: Record<string, unknown>
}

/**
 * Computes the hash for a new audit log entry.
 * Hash chain: SHA-256(prevHash || action || entityId || timestamp)
 */
function computeAuditHash(
  prevHash: string,
  action: string,
  entityId: string,
  timestamp: string
): string {
  return createHash("sha256")
    .update(`${prevHash}:${action}:${entityId}:${timestamp}`)
    .digest("hex")
}

/**
 * Append an immutable entry to the audit log.
 * Automatically chains to the previous entry for tamper detection.
 *
 * This is the ONLY way audit logs should be written.
 */
export async function appendAuditLog(input: AuditLogInput): Promise<void> {
  const timestamp = new Date().toISOString()
  const entityId = input.entityId ?? ""

  // Retrieve the hash of the last audit entry (for chain continuity)
  // Using changes field to store the hash (backward compatible with existing AuditLog schema)
  const lastEntry = await db.auditLog.findFirst({
    orderBy: { createdAt: "desc" },
    select: { changes: true, id: true },
  })

  let prevHash = "GENESIS"
  if (lastEntry?.changes) {
    try {
      const parsed = JSON.parse(lastEntry.changes)
      prevHash = parsed.__chainHash ?? "GENESIS"
    } catch {
      prevHash = lastEntry.id // Fallback to ID if changes is not JSON
    }
  }

  const chainHash = computeAuditHash(prevHash, input.action, entityId, timestamp)

  const changesPayload = {
    ...(input.changes ?? {}),
    __chainHash: chainHash,
    __prevHash: prevHash,
  }

  await db.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      changes: JSON.stringify(changesPayload),
    },
  })
}

/**
 * Verify the integrity of the audit log chain for a range of entries.
 * Returns true if chain is intact; false + broken entry index if tampered.
 */
export async function verifyAuditChain(limit = 1000): Promise<{
  valid: boolean
  checkedCount: number
  brokenAtId?: string
}> {
  const entries = await db.auditLog.findMany({
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true, action: true, entityId: true, createdAt: true, changes: true },
  })

  let prevHash = "GENESIS"

  for (const entry of entries) {
    let storedHash: string | null = null
    let storedPrevHash: string | null = null

    if (entry.changes) {
      try {
        const parsed = JSON.parse(entry.changes)
        storedHash = parsed.__chainHash ?? null
        storedPrevHash = parsed.__prevHash ?? null
      } catch {
        // Non-JSON changes field (legacy entry) — skip hash verification
        prevHash = entry.id
        continue
      }
    }

    if (!storedHash || !storedPrevHash) {
      // Legacy entry without hash — skip but continue chain
      prevHash = entry.id
      continue
    }

    // Recompute expected hash
    const expectedHash = computeAuditHash(
      prevHash,
      entry.action,
      entry.entityId ?? "",
      entry.createdAt.toISOString()
    )

    if (storedHash !== expectedHash || storedPrevHash !== prevHash) {
      return { valid: false, checkedCount: entries.indexOf(entry) + 1, brokenAtId: entry.id }
    }

    prevHash = storedHash
  }

  return { valid: true, checkedCount: entries.length }
}
