"use client"

import type React from "react"

import { useState } from "react"
import { Bell, Package, Heart, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Notification {
  id: string
  type: "order" | "wishlist" | "promotion" | "system"
  title: string
  message: string
  timestamp: string
  read: boolean
  icon: React.ReactNode
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "order",
      title: "Order Shipped",
      message: "Your order #12345 has been shipped and is on the way!",
      timestamp: "2 hours ago",
      read: false,
      icon: <Package className="h-4 w-4" />,
    },
    {
      id: "2",
      type: "wishlist",
      title: "Price Drop Alert",
      message: "iPhone 15 Pro in your wishlist is now 10% off!",
      timestamp: "5 hours ago",
      read: false,
      icon: <Heart className="h-4 w-4" />,
    },
    {
      id: "3",
      type: "promotion",
      title: "Flash Sale",
      message: "Limited time offer: 50% off on electronics!",
      timestamp: "1 day ago",
      read: true,
      icon: <Tag className="h-4 w-4" />,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{unreadCount}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <Badge variant="secondary">{unreadCount} new</Badge>
        </div>
        <ScrollArea className="h-80">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-3 mb-2 cursor-pointer transition-colors ${
                    !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">{notification.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.timestamp}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notification.id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
