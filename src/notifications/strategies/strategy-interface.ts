import { NormalizedNotification } from "../notification-mapper"

export interface NotificationStrategy {
  send(notification: NormalizedNotification): Promise<any>
}
