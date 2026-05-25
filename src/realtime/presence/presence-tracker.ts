import { SocketSession, PresenceMetrics } from "../types/socket"

class PresenceTracker {
  private sessions = new Map<string, SocketSession>()

  /**
   * Register a new connection socket session
   */
  addSession(session: SocketSession): void {
    this.sessions.set(session.sessionId, session)
  }

  /**
   * Remove a connection socket session upon disconnect
   */
  removeSession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  /**
   * Retrieve a target socket session
   */
  getSession(sessionId: string): SocketSession | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * List all currently active connection socket sessions
   */
  getAllSessions(): SocketSession[] {
    return Array.from(this.sessions.values())
  }

  /**
   * Aggregate realtime active connection counts and user telemetry
   */
  getMetrics(): PresenceMetrics {
    const totalConnections = this.sessions.size
    const activeUsersSet = new Set<string>()
    let anonymousSessions = 0

    this.sessions.forEach((session) => {
      if (session.isAnonymous) {
        anonymousSessions++
      } else if (session.userId) {
        activeUsersSet.add(session.userId)
      }
    })

    return {
      totalConnections,
      activeUsers: activeUsersSet.size,
      anonymousSessions,
    }
  }

  /**
   * Clear tracking registry state
   */
  clear(): void {
    this.sessions.clear()
  }
}

export const presenceTracker = new PresenceTracker()
export type { PresenceTracker }
