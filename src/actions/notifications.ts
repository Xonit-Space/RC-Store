"use server"

import {
  getUserNotifications,
  getUserUnreadCount,
  markNotificationAsRead,
} from "@/notifications/notification-engine"

/**
 * Server Action: Fetch all notification logs for a user
 */
export async function fetchUserNotificationsAction(userId: string) {
  try {
    return await getUserNotifications(userId)
  } catch (error) {
    console.error(`Failed to fetch notifications for user ${userId}:`, error)
    throw new Error("Failed to retrieve notifications")
  }
}

/**
 * Server Action: Fetch user unread count
 */
export async function getUnreadCountAction(userId: string): Promise<number> {
  try {
    return await getUserUnreadCount(userId)
  } catch (error) {
    console.error(`Failed to aggregate unread count for user ${userId}:`, error)
    return 0;
  }
}

/**
 * Server Action: Toggle notification status to read
 */
export async function markAsReadAction(notificationId: string) {
  try {
    return await markNotificationAsRead(notificationId)
  } catch (error) {
    console.error(`Failed to toggle read state for notification ${notificationId}:`, error)
    throw new Error("Failed to update notification read status")
  }
}
