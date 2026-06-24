import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest"
import { WebSocket } from "ws"
import { db } from "@/lib/db"
import { initializeWSServer, shutdownWSServer } from "../realtime/gateway/ws-gateway"
import { presenceTracker } from "../realtime/presence/presence-tracker"
import { subscriptionManager } from "../realtime/subscriptions/subscription-manager"
import { emitDomainEvent } from "@/events/emitters/emitter"
import { clearAllHandlers } from "@/events/handlers/handler-registry"
import { mapEventToNotification } from "../notifications/notification-mapper"
import { routeNotification } from "../notifications/notification-router"
import { processDomainEvent, getUserNotifications, getUserUnreadCount, markNotificationAsRead } from "../notifications/notification-engine"
import { initializeNotificationPipeline } from "../notifications/event-subscriber"
import { DomainEventEnvelope } from "@/events/contracts/events"

const TEST_PORT = 3003 // Use 3003 to avoid collision with websocket.test.ts which owns 3002
const TEST_WS_URL = `ws://localhost:${TEST_PORT}`

describe("Aussie Rigs Arena Realtime Notifications Integration Tests", () => {
  
  beforeAll(async () => {
    // 1. Initialize WebSocket server gateway on port 3002
    initializeWSServer(TEST_PORT)
    // 2. Initialize notifications event subscriber hooks
    initializeNotificationPipeline()
  })

  afterAll(async () => {
    // Graceful WS shutdown
    await shutdownWSServer()
  })

  beforeEach(async () => {
    presenceTracker.clear()
    subscriptionManager.clear()
    clearAllHandlers()
    
    // Re-initialize notification pipeline since clearAllHandlers wipes hooks!
    initializeNotificationPipeline()
    
    // Wipe notifications, logs, and target users
    await db.notification.deleteMany({})
    await db.domainEventLog.deleteMany({})
    await db.user.deleteMany({
      where: {
        id: { in: ["usr_new_buyer", "usr_realtime_buyer", "usr_buyer_7"] }
      }
    })

    // Seed required test users in PostgreSQL to satisfy foreign key constraints
    await db.user.create({
      data: {
        id: "usr_buyer_7",
        email: "buyer7@neoshop.test",
        passwordHash: "mock_password_hash",
        name: "Neo Buyer Seven",
      }
    })

    await db.user.create({
      data: {
        id: "usr_new_buyer",
        email: "new_buyer@neoshop.test",
        passwordHash: "mock_password_hash",
        name: "Neo New Buyer",
      }
    })

    await db.user.create({
      data: {
        id: "usr_realtime_buyer",
        email: "realtime_buyer@neoshop.test",
        passwordHash: "mock_password_hash",
        name: "Neo Realtime Buyer",
      }
    })
  })

  afterEach(async () => {
    presenceTracker.clear()
    subscriptionManager.clear()
    clearAllHandlers()
    await db.notification.deleteMany({})
    await db.domainEventLog.deleteMany({})
    await db.user.deleteMany({
      where: {
        id: { in: ["usr_new_buyer", "usr_realtime_buyer", "usr_buyer_7"] }
      }
    })
  })

  // --------------------------------------------------
  // 1. Notification Mapping & Routing
  // --------------------------------------------------
  describe("Mapper & Router Rules", () => {
    it("should correctly translate domain events to e-commerce notification requests", () => {
      const envelope: DomainEventEnvelope = {
        eventId: "ev_1",
        eventType: "ORDER_CREATED",
        timestamp: new Date(),
        payload: {
          orderId: "ord_confirm_1",
          userId: "usr_buyer_7",
          total: 150.0,
          items: [{ variantId: "var_1", quantity: 1, price: 150.0 }],
        },
      }

      const notif = mapEventToNotification(envelope)

      expect(notif).toBeDefined()
      expect(notif?.userId).toBe("usr_buyer_7")
      expect(notif?.type).toBe("ORDER")
      expect(notif?.title).toContain("Created")
      expect(notif?.message).toContain("ord_confirm_1")
    })

    it("should ignore low-priority telemetry events", () => {
      const envelope: DomainEventEnvelope = {
        eventId: "ev_2",
        eventType: "PRODUCT_VIEWED",
        timestamp: new Date(),
        payload: { productId: "prod_nike", userId: "usr_buyer_7" },
      }

      const notif = mapEventToNotification(envelope)
      expect(notif).toBeNull()
    })

    it("should decide appropriate delivery channels including Resend email for critical transactions", () => {
      const orderNotification = {
        userId: "usr_buyer_7",
        type: "ORDER" as const,
        title: "Order Created Successfully",
        message: "Thank you for shopping!",
      }

      const channels = routeNotification(orderNotification)
      expect(channels).toContain("IN_APP")
      expect(channels).toContain("WEBSOCKET")
      expect(channels).toContain("EMAIL") // Crucial transaction triggers email strategy!
    })
  })

  // --------------------------------------------------
  // 2. Database Logs & Status Operations
  // --------------------------------------------------
  describe("Database Logs Logging & Operations", () => {
    it("should successfully log notifications and toggle read states in database", async () => {
      const envelope: DomainEventEnvelope = {
        eventId: "ev_3",
        eventType: "USER_REGISTERED",
        timestamp: new Date(),
        payload: {
          userId: "usr_new_buyer",
          email: "welcome@neoshop.ultra",
          name: "Neo Member",
        },
      }

      // Process domain event -> triggers database InApp log insert
      await processDomainEvent(envelope)

      // Fetch from db
      const logs = await getUserNotifications("usr_new_buyer")
      expect(logs).toHaveLength(1)
      expect(logs[0].userId).toBe("usr_new_buyer")
      expect(logs[0].type).toBe("SYSTEM")
      expect(logs[0].read).toBe(false)

      const unreadCount = await getUserUnreadCount("usr_new_buyer")
      expect(unreadCount).toBe(1)

      // Mark as read
      await markNotificationAsRead(logs[0].id)

      const updatedCount = await getUserUnreadCount("usr_new_buyer")
      expect(updatedCount).toBe(0)
    })
  })

  // --------------------------------------------------
  // 3. WebSockets Realtime Streaming Delivery
  // --------------------------------------------------
  describe("Realtime Sockets Stream Delivery", () => {
    it(
      "should seamlessly bridge: emitDomainEvent -> Event Bus -> Notification Engine -> WebSocket client",
      { timeout: 10000 },
      () => {
        return new Promise<void>((resolve, reject) => {
          const client = new WebSocket(`${TEST_WS_URL}?token=usr_realtime_buyer`)

          let notificationPayload: any = null
          let settled = false

          // Guard: prevents double resolve/reject from racing timeouts
          const finish = (err?: Error) => {
            if (settled) return
            settled = true
            client.close()
            if (err) reject(err)
            else resolve()
          }

          client.on("open", () => {
            // Subscribe client to notifications channel
            client.send(JSON.stringify({ type: "subscribe", channel: "notifications:usr_realtime_buyer" }))
          })

          client.on("message", (data) => {
            const envelope = JSON.parse(data.toString())
            // Intercept notification pushes
            if (envelope.type === "event" && envelope.payload?.title === "Order Created Successfully") {
              notificationPayload = envelope.payload
            }
          })

          client.on("error", (err) => finish(err))

          // Wait 300ms for handshake + subscription to fully register before firing event
          setTimeout(async () => {
            try {
              const domainPayload = {
                orderId: "ord_realtime_101",
                userId: "usr_realtime_buyer",
                total: 399.0,
                items: [{ variantId: "var_hoodie", quantity: 1, price: 399.0 }],
              }

              // Emit Order Created Event
              // Bridge: emitDomainEvent -> Event Bus -> Notification Pipeline -> WebSocket -> Client
              await emitDomainEvent("ORDER_CREATED", domainPayload)

              // Allow 500ms for full async propagation under parallel test load
              setTimeout(() => {
                try {
                  expect(notificationPayload).toBeDefined()
                  expect(notificationPayload.message).toContain("ord_realtime_101")
                  expect(notificationPayload.type).toBe("ORDER")
                  finish()
                } catch (assertionErr) {
                  finish(assertionErr as Error)
                }
              }, 500)
            } catch (err) {
              finish(err as Error)
            }
          }, 300)
        })
      }
    )
  })
})
