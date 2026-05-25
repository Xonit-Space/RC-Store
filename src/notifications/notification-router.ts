import { NormalizedNotification } from "./notification-mapper"

export type DeliveryChannel = "IN_APP" | "WEBSOCKET" | "EMAIL"

/**
 * Notification Router:
 * Evaluates mapped e-commerce notifications and determines which active channels should deliver the message.
 */
export function routeNotification(notification: NormalizedNotification): DeliveryChannel[] {
  // Database persistence (InApp) and realtime pushes (WebSockets) are enabled by default for all updates
  const channels: DeliveryChannel[] = ["IN_APP", "WEBSOCKET"]

  // Route critical client lifecycle milestones to Email (Resend) as well
  if (
    (notification.type === "ORDER" && notification.title.includes("Created")) ||
    (notification.type === "SYSTEM" && notification.title.includes("Welcome"))
  ) {
    channels.push("EMAIL")
  }

  return channels
}
