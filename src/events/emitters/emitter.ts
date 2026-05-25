import crypto from "crypto"
import { db } from "@/lib/db"
import { EventSchemaRegistry, EventType, DomainEventEnvelope } from "../contracts/events"
import { publishEventToBus } from "../bus/event-bus"

// Retrieve secure event secret
const SECRET_KEY = process.env.EVENT_BUS_SECRET || "neoshop_ultra_default_cryptographic_signing_secret_2026"

/**
 * Generate a cryptographically secure HMAC signature for event validation
 */
export function generateEventSignature(eventId: string, eventType: string, payload: any): string {
  const hmac = crypto.createHmac("sha256", SECRET_KEY)
  const data = JSON.stringify({ eventId, eventType, payload })
  hmac.update(data)
  return hmac.digest("hex")
}

/**
 * Verify event signatures using constant-time comparisons to prevent timing attacks
 */
export function verifyEventSignature(envelope: {
  eventId: string
  eventType: string
  payload: any
  signature?: string
}): boolean {
  if (!envelope.signature) return false

  try {
    const expected = generateEventSignature(envelope.eventId, envelope.eventType, envelope.payload)
    const expectedBuffer = Buffer.from(expected, "hex")
    const actualBuffer = Buffer.from(envelope.signature, "hex")

    if (expectedBuffer.length !== actualBuffer.length) {
      return false
    }

    return crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  } catch {
    return false
  }
}

/**
 * Validates, cryptographically signs, persists, and publishes domain events
 */
export async function emitDomainEvent<T extends EventType>(
  eventType: T,
  payload: z.infer<typeof EventSchemaRegistry[T]>
): Promise<DomainEventEnvelope<z.infer<typeof EventSchemaRegistry[T]>>> {
  // 1. Validate payload using target Zod Schema
  const schema = EventSchemaRegistry[eventType]
  if (!schema) {
    throw new Error(`Unsupported event type requested: ${eventType}`)
  }

  const parseResult = schema.safeParse(payload)
  if (!parseResult.success) {
    throw new Error(
      `Invalid event payload for type ${eventType}: ${JSON.stringify(parseResult.error.format())}`
    )
  }

  const validatedPayload = parseResult.data

  // 2. Generate envelope parameters
  const eventId = `ev_${crypto.randomUUID().replace(/-/g, "")}`
  const timestamp = new Date()
  const signature = generateEventSignature(eventId, eventType, validatedPayload)

  const envelope: DomainEventEnvelope<typeof validatedPayload> = {
    eventId,
    eventType,
    timestamp,
    payload: validatedPayload,
    signature,
  }

  // 3. Persist to PostgreSQL DomainEventLog ledger for audits & replayability
  try {
    await db.domainEventLog.create({
      data: {
        eventId,
        eventType,
        payload: JSON.stringify(validatedPayload),
        signature,
        status: "PUBLISHED",
        createdAt: timestamp,
      },
    })
  } catch (dbError) {
    console.error(`Event Bus failed to persist event ${eventId} in database:`, dbError)
    // Throw database failure to guarantee consistency in transactional sagas
    throw new Error(`Database persistence failure for event ${eventType}: ${String(dbError)}`)
  }

  // 4. Publish onto the distributed Event Bus channels
  try {
    await publishEventToBus(eventType, envelope)
  } catch (busError) {
    console.error(`Event Bus failed to publish event ${eventId} onto bus:`, busError)
    // Update log status to denote bus error
    await db.domainEventLog.update({
      where: { eventId },
      data: { status: "FAILED" },
    }).catch(() => {})
    
    throw new Error(`Event Bus publication failure for event ${eventType}: ${String(busError)}`)
  }

  return envelope;
}
import { z } from "zod"
