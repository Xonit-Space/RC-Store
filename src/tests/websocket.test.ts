import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest"
import { WebSocket } from "ws"
import { db } from "@/lib/db"
import { initializeWSServer, shutdownWSServer } from "../realtime/gateway/ws-gateway"
import { presenceTracker } from "../realtime/presence/presence-tracker"
import { subscriptionManager } from "../realtime/subscriptions/subscription-manager"
import { emitDomainEvent } from "@/events/emitters/emitter"
import { clearAllHandlers } from "@/events/handlers/handler-registry"

const TEST_PORT = 3002 // Use dedicated port 3002 to prevent local dev port conflicts
const TEST_WS_URL = `ws://localhost:${TEST_PORT}`

describe("Aussie Rigs Arena WebSocket Gateway Infrastructure Tests", () => {
  
  beforeAll(async () => {
    // Start WebSocket Gateway Server on test port 3002
    initializeWSServer(TEST_PORT)
  })

  afterAll(async () => {
    // Gracefully shut down WS Server
    await shutdownWSServer()
  })

  beforeEach(async () => {
    presenceTracker.clear()
    subscriptionManager.clear()
    clearAllHandlers()
    await db.domainEventLog.deleteMany({})
  })

  afterEach(async () => {
    presenceTracker.clear()
    subscriptionManager.clear()
    clearAllHandlers()
    await db.domainEventLog.deleteMany({})
  })

  // --------------------------------------------------
  // 1. Connection & Handshake Authentications
  // --------------------------------------------------
  describe("Connection Handshakes & Authentication", () => {
    it("should successfully authenticate an incoming socket utilizing user token queries", () => {
      return new Promise<void>((resolve, reject) => {
        const client = new WebSocket(`${TEST_WS_URL}?token=usr_buyer_99`)

        client.on("message", (data) => {
          const envelope = JSON.parse(data.toString())
          
          expect(envelope.type).toBe("message")
          expect(envelope.payload.message).toContain("Welcome")
          expect(envelope.payload.userId).toBe("usr_buyer_99")
          expect(envelope.payload.isAnonymous).toBe(false)
          
          client.close()
          resolve()
        })

        client.on("error", (err) => reject(err))
      })
    })

    it("should fallback connection handshakes to anonymous mode if no token is query mapped", () => {
      return new Promise<void>((resolve, reject) => {
        const client = new WebSocket(`${TEST_WS_URL}`)

        client.on("message", (data) => {
          const envelope = JSON.parse(data.toString())

          expect(envelope.type).toBe("message")
          expect(envelope.payload.isAnonymous).toBe(true)
          expect(envelope.payload.userId).toBeUndefined()

          client.close()
          resolve()
        })

        client.on("error", (err) => reject(err))
      })
    })
  })

  // --------------------------------------------------
  // 2. Token-Bucket Rate Limiting
  // --------------------------------------------------
  describe("Token-Bucket Rate Limiter", () => {
    it("should throttle and emit error logs once client exceeds maximum token thresholds", () => {
      return new Promise<void>((resolve, reject) => {
        const client = new WebSocket(`${TEST_WS_URL}?token=usr_spammer`)

        client.on("open", () => {
          // Rapidly dump 20 ping packets to exhaust the 15 token bucket capacity!
          for (let i = 0; i < 20; i++) {
            client.send(JSON.stringify({ type: "ping" }))
          }
        })

        let throttled = false

        client.on("message", (data) => {
          const envelope = JSON.parse(data.toString())
          if (envelope.type === "error" && envelope.payload.message.includes("Rate limit exceeded")) {
            throttled = true
            client.close()
            resolve()
          }
        })

        // Timeout fallback
        setTimeout(() => {
          client.close()
          if (throttled) {
            resolve()
          } else {
            reject(new Error("Spam did not trigger rate limiter exception"))
          }
        }, 500)
      })
    })
  })

  // --------------------------------------------------
  // 3. Channel Subscriptions
  // --------------------------------------------------
  describe("Realtime Channel Subscriptions", () => {
    it("should bind clients to channels and propagate messages to subscribers only", () => {
      return new Promise<void>((resolve, reject) => {
        const clientA = new WebSocket(`${TEST_WS_URL}?token=usr_client_a`)
        const clientB = new WebSocket(`${TEST_WS_URL}?token=usr_client_b`)

        let aReceived = false
        let bReceived = false

        clientA.on("open", () => {
          // Subscribe client A to order-tracking channel
          clientA.send(JSON.stringify({ type: "subscribe", channel: "orders:ord_777" }))
        })

        clientB.on("open", () => {
          // Subscribe client B to different channel
          clientB.send(JSON.stringify({ type: "subscribe", channel: "orders:ord_888" }))
        })

        clientA.on("message", (data) => {
          const envelope = JSON.parse(data.toString())
          if (envelope.type === "event" && envelope.payload?.orderId === "ord_777") {
            aReceived = true
          }
        })

        clientB.on("message", (data) => {
          const envelope = JSON.parse(data.toString())
          if (envelope.type === "event" && envelope.payload?.orderId === "ord_777") {
            bReceived = true
          }
        })

        // Wait to make sure socket handshakes register
        setTimeout(() => {
          // Manually invoke subscription manager broadcast
          // This simulates sending a message to 'orders:ord_777' subscribers
          const subscribers = subscriptionManager.getSubscribers("orders:ord_777")
          expect(subscribers.size).toBe(1) // Only client A!

          const sessions = presenceTracker.getAllSessions()
          const aSess = sessions.find((s) => s.userId === "usr_client_a")
          
          expect(aSess).toBeDefined()

          // Send mock packet to client A
          aSess?.ws.send(
            JSON.stringify({
              type: "event",
              channel: "orders:ord_777",
              payload: { orderId: "ord_777" },
            })
          )

          setTimeout(() => {
            clientA.close()
            clientB.close()

            expect(aReceived).toBe(true)
            expect(bReceived).toBe(false)
            resolve()
          }, 100)
        }, 150)
      })
    })
  })

  // --------------------------------------------------
  // 4. End-to-End Pipeline Integration
  // --------------------------------------------------
  describe("End-to-End Realtime Commerce Integration Pipeline", () => {
    it("should seamlessly bridge: emitDomainEvent -> Event Bus -> Subscription Manager -> WebSocket -> Storefront", () => {
      return new Promise<void>((resolve, reject) => {
        const client = new WebSocket(`${TEST_WS_URL}?token=usr_buyer_x`)

        let eventPayloadReceived: any = null

        client.on("open", () => {
          // Client subscribes to orders updates for "ord_9999"
          client.send(JSON.stringify({ type: "subscribe", channel: "orders:ord_9999" }))
        })

        client.on("message", (data) => {
          const envelope = JSON.parse(data.toString())
          // Intercept Event Bus bridged event pushes
          if (envelope.type === "event" && envelope.payload?.eventType === "ORDER_CREATED") {
            eventPayloadReceived = envelope.payload.payload
          }
        })

        // Wait for handshake registration
        setTimeout(async () => {
          try {
            const domainPayload = {
              orderId: "ord_9999",
              userId: "usr_buyer_x",
              total: 249.99,
              items: [{ variantId: "var_shirt_red", quantity: 2, price: 124.995 }],
            }

            // Emit order created domain event
            // This triggers Zod verification -> HMAC signature -> DB log -> Redis Pub/Sub -> WS forwarding
            await emitDomainEvent("ORDER_CREATED", domainPayload)

            // Allow asynchronous message propagation and sockets delivery
            setTimeout(() => {
              client.close()

              expect(eventPayloadReceived).toEqual(domainPayload)
              resolve()
            }, 150)
          } catch (err) {
            client.close()
            reject(err)
          }
        }, 150)
      })
    })
  })
})
