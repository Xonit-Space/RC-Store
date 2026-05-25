import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { db } from "@/lib/db"
import { emitDomainEvent, verifyEventSignature } from "../events/emitters/emitter"
import { registerHandler, clearAllHandlers, executeHandlers } from "../events/handlers/handler-registry"
import { replayEvents } from "../events/replay/replay-manager"
import { DomainEventEnvelope } from "../events/contracts/events"

describe("Neoshop Event Bus Infrastructure Tests", () => {
  
  // Clean registry and database logs before and after each run
  beforeEach(async () => {
    clearAllHandlers()
    await db.domainEventLog.deleteMany({})
  })

  afterEach(async () => {
    clearAllHandlers()
    await db.domainEventLog.deleteMany({})
  })

  // --------------------------------------------------
  // 1. Zod Schema Validations
  // --------------------------------------------------
  describe("Zod Payload Validation", () => {
    it("should successfully emit when payload parameters matches contract definition", async () => {
      const payload = {
        userId: "usr_123",
        email: "support@neoshop.ultra",
        name: "Neo Buyer",
      }

      const envelope = await emitDomainEvent("USER_REGISTERED", payload)

      expect(envelope).toBeDefined()
      expect(envelope.eventId).toBeDefined()
      expect(envelope.eventType).toBe("USER_REGISTERED")
      expect(envelope.payload).toEqual(payload)
      expect(envelope.signature).toBeDefined()
    })

    it("should throw a validation error if payload parameters violate schema constraints", async () => {
      const invalidPayload = {
        userId: "usr_123",
        email: "not-an-email", // Violates email schema contract!
      }

      await expect(
        emitDomainEvent("USER_REGISTERED", invalidPayload as any)
      ).rejects.toThrow("Invalid event payload for type USER_REGISTERED")
    })
  })

  // --------------------------------------------------
  // 2. Cryptographic Security Signatures
  // --------------------------------------------------
  describe("Cryptographic Signature Audit Guards", () => {
    it("should verify signature validity for correctly generated envelopes", async () => {
      const payload = {
        productId: "prod_nike_air",
        userId: "usr_99",
      }

      const envelope = await emitDomainEvent("PRODUCT_VIEWED", payload)
      const isValid = verifyEventSignature(envelope)

      expect(isValid).toBe(true)
    })

    it("should reject tampered or unsigned envelope packets immediately", async () => {
      const payload = {
        productId: "prod_nike_air",
        userId: "usr_99",
      }

      const envelope = await emitDomainEvent("PRODUCT_VIEWED", payload)
      
      // Attempt to tamper with payload parameters
      const tamperedEnvelope = {
        ...envelope,
        payload: {
          ...envelope.payload,
          productId: "prod_something_else", // Tampered!
        },
      }

      const isValid = verifyEventSignature(tamperedEnvelope)
      expect(isValid).toBe(false)
    })

    it("should raise a security error inside executeHandlers if signature is invalid", async () => {
      const envelope: DomainEventEnvelope = {
        eventId: "ev_fake",
        eventType: "PRODUCT_VIEWED",
        timestamp: new Date(),
        payload: { productId: "prod_nike_air" },
        signature: "invalid_sig", // Bad signature!
      }

      registerHandler("PRODUCT_VIEWED", () => {})

      await expect(
        executeHandlers("PRODUCT_VIEWED", envelope)
      ).rejects.toThrow("Security violation: Event packet has unsigned or tampered contents")
    })
  })

  // --------------------------------------------------
  // 3. Database Persistence Ledger
  // --------------------------------------------------
  describe("Database Persistence Ledger", () => {
    it("should persist log records directly to PostgreSQL upon publication", async () => {
      const payload = {
        reviewId: "rev_ultra_1",
        productId: "prod_99",
        userId: "usr_88",
        rating: 5,
        comment: "Outstanding product quality!",
      }

      const envelope = await emitDomainEvent("REVIEW_CREATED", payload)

      const dbLog = await db.domainEventLog.findUnique({
        where: { eventId: envelope.eventId },
      })

      expect(dbLog).toBeDefined()
      expect(dbLog?.eventType).toBe("REVIEW_CREATED")
      expect(JSON.parse(dbLog!.payload)).toEqual(payload)
      expect(dbLog?.signature).toBe(envelope.signature)
      expect(dbLog?.status).toBe("PUBLISHED")
    })
  })

  // --------------------------------------------------
  // 4. Real-time Pub/Sub Dispatches
  // --------------------------------------------------
  describe("Real-time Decoupled Event Dispatches", () => {
    it("should route event dispatches asynchronously to registered domain subscribers", async () => {
      const payload = {
        orderId: "ord_1001",
        userId: "usr_buyer_1",
        total: 199.95,
        items: [
          { variantId: "var_shoe_1", quantity: 1, price: 199.95 },
        ],
      }

      let handlerReceived: any = null

      registerHandler("ORDER_CREATED", (envelope) => {
        handlerReceived = envelope.payload
      })

      await emitDomainEvent("ORDER_CREATED", payload)

      // Allow event propagation tick
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(handlerReceived).toEqual(payload)
    })
  })

  // --------------------------------------------------
  // 5. Event Log Replays
  // --------------------------------------------------
  describe("Chronological State Replay Recovery", () => {
    it("should query database logs and replay streams sequentially through listeners", async () => {
      const firstPayload = {
        refundId: "ref_1",
        orderId: "ord_1",
        amount: 50.0,
        reason: "Sizing mismatch",
      }

      const secondPayload = {
        refundId: "ref_2",
        orderId: "ord_2",
        amount: 80.0,
        reason: "Color mismatch",
      }

      // Emit two events to persist them into domain event logs
      const env1 = await emitDomainEvent("REFUND_ISSUED", firstPayload)
      const env2 = await emitDomainEvent("REFUND_ISSUED", secondPayload)

      // Confirm both are saved in database
      const count = await db.domainEventLog.count()
      expect(count).toBe(2)

      const replayedPayloads: any[] = []

      // Register handler to trace replay calls
      registerHandler("REFUND_ISSUED", (envelope) => {
        replayedPayloads.push(envelope.payload)
      })

      // Wipe/reset local trace variables to make sure we only capture replay dispatches
      replayedPayloads.length = 0

      // Execute chronological database replay
      const replayResult = await replayEvents({ eventType: "REFUND_ISSUED" })

      expect(replayResult.total).toBe(2)
      expect(replayResult.replayed).toBe(2)
      expect(replayResult.failed).toBe(0)

      // Subscriptions should receive payloads in chronological sequence!
      expect(replayedPayloads).toHaveLength(2)
      expect(replayedPayloads[0]).toEqual(firstPayload)
      expect(replayedPayloads[1]).toEqual(secondPayload)

      // Log status in database should have transitioned to REPLAYED
      const log1 = await db.domainEventLog.findUnique({ where: { eventId: env1.eventId } })
      const log2 = await db.domainEventLog.findUnique({ where: { eventId: env2.eventId } })

      expect(log1?.status).toBe("REPLAYED")
      expect(log2?.status).toBe("REPLAYED")
    })
  })
})
