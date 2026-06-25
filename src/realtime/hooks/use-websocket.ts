import { useEffect, useRef, useState, useCallback } from "react"

export interface UseWebsocketOptions {
  token?: string
  autoConnect?: boolean
  onMessage?: (type: string, payload: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export interface UseWebsocketResult {
  isConnected: boolean
  error: string | null
  subscribeToChannel: (channel: string, callback: (payload: any) => void) => void
  unsubscribeFromChannel: (channel: string) => void
  send: (message: any) => void
  connect: () => void
  disconnect: () => void
}

function getWebSocketUrl(token?: string): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_WS_URL
  if (!baseUrl) return null

  const separator = baseUrl.includes("?") ? "&" : "?"
  return `${baseUrl}${separator}token=${encodeURIComponent(token || "anonymous")}`
}

/**
 * Resilient Storefront WebSocket Hook:
 * Manages heartbeats, exponential backoff reconnects, SSR safety,
 * offline message queues, and active channel re-subscriptions.
 */
export function useWebsocket(options: UseWebsocketOptions = {}): UseWebsocketResult {
  const { token, autoConnect = true, onMessage, onConnect, onDisconnect } = options
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const socketRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const messageQueueRef = useRef<any[]>([])

  const callbacksRef = useRef<Map<string, Set<(payload: any) => void>>>(new Map())

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
    setIsConnected(false)
  }, [])

  const connect = useCallback(() => {
    if (typeof window === "undefined") return

    const url = getWebSocketUrl(token)
    if (!url) {
      return
    }

    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)
    ) {
      return
    }

    try {
      const socket = new WebSocket(url)
      socketRef.current = socket

      socket.onopen = () => {
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0

        onConnect?.()

        const queue = messageQueueRef.current
        messageQueueRef.current = []
        queue.forEach((msg) => {
          socket.send(JSON.stringify(msg))
        })

        Array.from(callbacksRef.current.keys()).forEach((channel) => {
          socket.send(JSON.stringify({ type: "subscribe", channel }))
        })
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === "ping") {
            socket.send(JSON.stringify({ type: "pong" }))
            return
          }

          if (data.type === "event" && data.channel) {
            const channelCallbacks = callbacksRef.current.get(data.channel)
            channelCallbacks?.forEach((callback) => {
              try {
                callback(data.payload)
              } catch (cbErr) {
                console.error("Storefront WebSocket callback execution failed:", cbErr)
              }
            })
          }

          onMessage?.(data.type, data.payload)
        } catch (err) {
          console.error("Storefront WebSocket failed to parse message envelope:", err)
        }
      }

      socket.onclose = () => {
        setIsConnected(false)
        onDisconnect?.()
        scheduleReconnect()
      }

      socket.onerror = () => {
        setError("WebSocket connection error occurred")
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize WebSocket client")
      scheduleReconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, onConnect, onDisconnect, onMessage])

  const scheduleReconnect = useCallback(() => {
    if (!getWebSocketUrl(token)) return

    if (reconnectAttemptsRef.current >= 5) {
      setError("Maximum WebSocket reconnect attempts reached.")
      return
    }

    const backoffMs = Math.min(16000, 1000 * Math.pow(2, reconnectAttemptsRef.current))
    reconnectAttemptsRef.current++

    setTimeout(() => {
      connect()
    }, backoffMs)
  }, [connect, token])

  const send = useCallback((message: any) => {
    const socket = socketRef.current
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
    } else {
      messageQueueRef.current.push(message)
    }
  }, [])

  const subscribeToChannel = useCallback(
    (channel: string, callback: (payload: any) => void) => {
      const channelCallbacks = callbacksRef.current.get(channel) || new Set()
      channelCallbacks.add(callback)
      callbacksRef.current.set(channel, channelCallbacks)

      send({ type: "subscribe", channel })
    },
    [send]
  )

  const unsubscribeFromChannel = useCallback(
    (channel: string) => {
      callbacksRef.current.delete(channel)
      send({ type: "unsubscribe", channel })
    },
    [send]
  )

  useEffect(() => {
    if (autoConnect && getWebSocketUrl(token)) {
      connect()
    }
    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect, token])

  return {
    isConnected,
    error,
    subscribeToChannel,
    unsubscribeFromChannel,
    send,
    connect,
    disconnect,
  }
}
