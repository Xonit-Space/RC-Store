import { useEffect, useState, useCallback } from "react"
import { useWebsocket } from "@/realtime/hooks/use-websocket"
import { toast } from "sonner"
import {
  fetchUserNotificationsAction,
  markAsReadAction,
  getUnreadCountAction,
} from "@/actions/notifications"

export interface UINotification {
  id: string
  type: string
  title: string
  message: string
  createdAt: string
  read: boolean
}

/**
 * useNotifications Storefront React Hook:
 * Manages notification center logs, aggregates unread counters,
 * shows Sonner toasts, and subscribes to real-time WebSocket pushes.
 */
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<UINotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  /**
   * Refreshes notification checklists and counts from database
   */
  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      const dbLogs = await fetchUserNotificationsAction(userId)
      const formatted = dbLogs.map((log) => ({
        id: log.id,
        type: log.type.toLowerCase(),
        title: log.title,
        message: log.message,
        createdAt: new Date(log.createdAt).toLocaleDateString(),
        read: log.read,
      }))
      setNotifications(formatted)

      const unreadCount = await getUnreadCountAction(userId)
      setUnreadCount(unreadCount)
    } catch (err) {
      console.error("useNotifications: Failed to sync history from database:", err)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  /**
   * Triggers when a realtime WebSocket message is received on the notifications channel
   */
  const onMessageReceived = useCallback((type: string, payload: any) => {
    if (type === "event" && payload) {
      const rawEvent = payload.payload || {}
      
      const newNotification: UINotification = {
        id: rawEvent.eventId || `sess_ev_${Date.now()}`,
        type: payload.type?.toLowerCase() || "system",
        title: payload.title || "Alert Received",
        message: payload.message || "",
        createdAt: new Date().toLocaleDateString(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev])
      setUnreadCount((count) => count + 1)

      // Trigger beautiful UI toast alert using Sonner
      toast(newNotification.title, {
        description: newNotification.message,
      })
    }
  }, [])

  // Link our client socket hooks
  const { subscribeToChannel, unsubscribeFromChannel } = useWebsocket({
    token: userId || "anonymous",
    autoConnect: !!userId,
  })

  useEffect(() => {
    if (!userId) return

    const userChannel = `notifications:${userId}`
    subscribeToChannel(userChannel, (payload) => {
      onMessageReceived("event", payload)
    })

    // If it's the admin, also hook into admin dashboard updates
    if (userId === "admin") {
      subscribeToChannel("admin:dashboard", (payload) => {
        onMessageReceived("event", payload)
      })
    }

    return () => {
      unsubscribeFromChannel(userChannel)
      if (userId === "admin") {
        unsubscribeFromChannel("admin:dashboard")
      }
    }
  }, [userId, subscribeToChannel, unsubscribeFromChannel, onMessageReceived])

  /**
   * Toggles notification state to read in UI and db asynchronously
   */
  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    )
    setUnreadCount((count) => Math.max(0, count - 1))

    try {
      await markAsReadAction(id)
    } catch (err) {
      console.error("useNotifications: Failed to toggle read state:", err)
    }
  }, [])

  /**
   * Removes notification from client view
   */
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  return {
    notifications,
    unreadCount,
    markAsRead,
    removeNotification,
    refresh,
  }
}
