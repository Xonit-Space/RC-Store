export interface RateLimiter {
  tokens: number
  lastRefill: number
}

export interface SocketSession {
  sessionId: string
  userId?: string
  isAnonymous: boolean
  ws: any // Using 'any' for WebSocket transport abstraction across browser / node environments
  isAlive: boolean
  ip?: string
  rateLimiter: RateLimiter
}

export interface PresenceMetrics {
  totalConnections: number
  activeUsers: number
  anonymousSessions: number
}

export interface SocketMessage {
  type: "subscribe" | "unsubscribe" | "ping" | "pong" | "message" | "event"
  channel?: string
  payload?: any
}
