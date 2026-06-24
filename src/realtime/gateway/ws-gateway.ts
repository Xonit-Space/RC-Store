import { WebSocketServer, WebSocket } from "ws"
import url from "url"
import crypto from "crypto"
import { presenceTracker } from "../presence/presence-tracker"
import { subscriptionManager, setGlobalWSGatewaySender } from "../subscriptions/subscription-manager"
import { SocketSession, SocketMessage } from "../types/socket"

const WS_PORT = parseInt(process.env.WS_PORT || "3001", 10)

let wss: WebSocketServer | null = null
let heartbeatInterval: NodeJS.Timeout | null = null

/**
 * WebSocket Gateway server initializer
 */
export function initializeWSServer(port: number = WS_PORT): WebSocketServer {
  wss = new WebSocketServer({ port })

  // Register the global sender hook to decouple Event Bus notifications from WS transports
  setGlobalWSGatewaySender((sessionIds, message) => {
    sessionIds.forEach((sessionId) => {
      const session = presenceTracker.getSession(sessionId)
      if (session && session.ws.readyState === WebSocket.OPEN) {
        try {
          session.ws.send(JSON.stringify(message))
        } catch (err) {
          console.error(`Failed to send WebSocket message frame to session ${sessionId}:`, err)
        }
      }
    })
  })

  wss.on("connection", (ws: WebSocket, req) => {
    // 1. Authenticate handshakes from URL queries
    const parsedUrl = url.parse(req.url || "", true)
    const token = parsedUrl.query.token as string

    let userId: string | undefined = undefined
    let isAnonymous = true

    if (token) {
      // Modern apps authenticate JWT cookie / headers.
      // For local development and testing, we support 'usr_' or generic placeholder IDs.
      if (token.startsWith("usr_") || token !== "anonymous") {
        userId = token
        isAnonymous = false
      }
    }

    // Security: Extract IP address and enforce concurrent connection limit
    let clientIp = req.socket.remoteAddress || "unknown"
    if (req.headers["x-forwarded-for"]) {
      clientIp = (req.headers["x-forwarded-for"] as string).split(",")[0]
    }
    
    // Check if IP exceeds 5 connections
    const currentSessions = presenceTracker.getAllSessions().filter(s => s.ip === clientIp)
    if (currentSessions.length >= 5) {
      console.warn(`[WSS] Connection rejected: IP ${clientIp} exceeded 5 connections.`)
      ws.close(1008, "Too many connections")
      return
    }

    const sessionId = `ws_sess_${crypto.randomUUID().replace(/-/g, "")}`

    const session: SocketSession = {
      sessionId,
      userId,
      isAnonymous,
      ws,
      isAlive: true,
      ip: clientIp, // Adding IP tracking to session
      rateLimiter: {
        tokens: 15,
        lastRefill: Date.now(),
      },
    }

    // Register connection inside presence tracker
    presenceTracker.addSession(session)

    // Push initial welcome parameters
    ws.send(
      JSON.stringify({
        type: "message",
        payload: {
          message: "Welcome to Aussie Rigs Arena Realtime Commerce Service",
          sessionId,
          userId,
          isAnonymous,
        },
      })
    )

    // 2. Wire client packet processing events
    ws.on("message", (rawData) => {
      try {
        const rawString = rawData.toString()
        // Security: Prevent extremely large payloads to avoid memory exhaustion (Max 8KB)
        if (rawString.length > 8192) {
          console.warn(`[WSS] Payload too large from IP ${clientIp}. Terminating.`)
          ws.close(1009, "Message too big")
          return
        }

        // Enforce Token-Bucket Rate Limiter
        if (!checkRateLimit(session)) {
          ws.send(
            JSON.stringify({
              type: "error",
              payload: { message: "Rate limit exceeded. Request throttled." },
            })
          )
          return
        }

        const message = JSON.parse(rawString) as SocketMessage

        // Standard connection checkouts
        if (message.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }))
          return
        }

        if (message.type === "pong") {
          session.isAlive = true
          return
        }

        // Channel subscriptions
        if (message.type === "subscribe" && message.channel) {
          subscriptionManager.subscribe(sessionId, message.channel, session)
          ws.send(
            JSON.stringify({
              type: "message",
              payload: { message: `Subscribed to channel: ${message.channel}` },
            })
          )
          return
        }

        // Channel unsubscribes
        if (message.type === "unsubscribe" && message.channel) {
          subscriptionManager.unsubscribe(sessionId, message.channel)
          ws.send(
            JSON.stringify({
              type: "message",
              payload: { message: `Unsubscribed from channel: ${message.channel}` },
            })
          )
          return
        }
      } catch (parseError) {
        ws.send(
          JSON.stringify({
            type: "error",
            payload: { message: "Invalid JSON format or envelope parameter" },
          })
        )
      }
    })

    // 3. Handle disconnect / socket errors
    ws.on("close", () => {
      subscriptionManager.unsubscribeAll(sessionId)
      presenceTracker.removeSession(sessionId)
    })

    ws.on("error", () => {
      subscriptionManager.unsubscribeAll(sessionId)
      presenceTracker.removeSession(sessionId)
    })
  })

  // 4. Start heartbeat ping/pong culler interval
  heartbeatInterval = setInterval(() => {
    presenceTracker.getAllSessions().forEach((session) => {
      if (!session.isAlive) {
        session.ws.terminate()
        subscriptionManager.unsubscribeAll(session.sessionId)
        presenceTracker.removeSession(session.sessionId)
        return
      }
      
      // Reset activity tracker and emit ping frame
      session.isAlive = false
      try {
        session.ws.send(JSON.stringify({ type: "ping" }))
      } catch {
        session.ws.terminate()
      }
    })
  }, 30000)

  return wss
}

/**
 * Shut down the WebSocket server and purge active mappings (used primarily in test teardowns)
 */
export function shutdownWSServer(): Promise<void> {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }

  return new Promise((resolve) => {
    if (wss) {
      presenceTracker.getAllSessions().forEach((session) => {
        try {
          session.ws.close()
        } catch {}
      })
      presenceTracker.clear()
      subscriptionManager.clear()

      wss.close(() => {
        wss = null
        resolve()
      })
    } else {
      resolve()
    }
  })
}

/**
 * Token-Bucket Rate Limiter:
 * Maximum capacity of 15 tokens, refills at 5 tokens per second.
 */
function checkRateLimit(session: SocketSession): boolean {
  const now = Date.now()
  const delta = now - session.rateLimiter.lastRefill
  const refill = Math.floor(delta / 1000) * 5

  session.rateLimiter.tokens = Math.min(15, session.rateLimiter.tokens + refill)
  session.rateLimiter.lastRefill = now

  if (session.rateLimiter.tokens <= 0) {
    return false
  }

  session.rateLimiter.tokens--
  return true
}
