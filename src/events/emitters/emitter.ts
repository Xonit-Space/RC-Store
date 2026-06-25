import crypto from "crypto"
import { z } from "zod"
import { db } from "@/lib/db"
import { EventSchemaRegistry, EventType, DomainEventEnvelope } from "../contracts/events"
import { publishEventToBus } from "../bus/event-bus"
import { executeHandlers } from "../handlers/handler-registry"
import { isServerless } from "@/lib/runtime"

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
    throw new Error(`Database persistence failure for event ${eventType}: ${String(dbError)}`)
  }

  try {
    await publishEventToBus(eventType, envelope)
  } catch (busError) {
    console.error(`Event Bus failed to publish event ${eventId} onto bus:`, busError)

    if (!isServerless) {
      await db.domainEventLog.update({
        where: { eventId },
        data: { status: "FAILED" },
      }).catch(() => {})

      throw new Error(`Event Bus publication failure for event ${eventType}: ${String(busError)}`)
    }
  }

  // On serverless, pub/sub subscribers are not wired — dispatch handlers inline.
  if (isServerless) {
    try {
      await executeHandlers(eventType, envelope)
    } catch (handlerError) {
      console.error(`Inline handler dispatch failed for event ${eventId} (${eventType}):`, handlerError)
    }
  }

  return envelope
}
