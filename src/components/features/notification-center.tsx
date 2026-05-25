"use client"

import type React from "react"
import { Bell, Package, Heart, Tag, X, CreditCard, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useNotifications } from "@/notifications/hooks/use-notifications"

// Retrieve target icon based on e-commerce notification type
function getNotificationIcon(type: string): React.ReactNode {
  switch (type.toLowerCase()) {
    case "order":
      return <Package className="h-4 w-4 text-blue-500" />
    case "payment":
      return <CreditCard className="h-4 w-4 text-emerald-500" />
    case "inventory":
      return <ShieldAlert className="h-4 w-4 text-amber-500" />
    case "promotion":
    case "promo":
      return <Tag className="h-4 w-4 text-purple-500" />
    case "wishlist":
      return <Heart className="h-4 w-4 text-rose-500" />
    case "system":
    default:
      return <Bell className="h-4 w-4 text-slate-500" />
  }
}

export function NotificationCenter() {
  // Use a default mock user id for storefront demo simulation
  const { notifications, unreadCount, markAsRead, removeNotification } = 
    useNotifications("usr_storefront_client")

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-500 hover:bg-red-600 animate-pulse text-white">
              {unreadCount}
            </Badge>
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
              <div className="text-center py-8 text-muted-foreground text-sm">No notifications yet</div>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-3 mb-2 cursor-pointer transition-all duration-200 hover:bg-muted ${
                    !notification.read ? "bg-blue-50/50 dark:bg-blue-950/10 border-l-2 border-l-blue-500" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notification.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-2">{notification.createdAt}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-60 hover:opacity-100"
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
