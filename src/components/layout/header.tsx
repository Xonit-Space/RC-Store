"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, User, Menu, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { SmartSearch } from "@/components/features/smart-search"
import { NotificationCenter } from "@/components/features/notification-center"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount] = useState(3) // This would come from global state

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NEOSHOP ULTRA
          </span>
        </Link>

        {/* Smart Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <SmartSearch />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />

          {/* Notifications */}
          <NotificationCenter />

          {/* Wishlist */}
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">2</Badge>
          </Button>

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{cartCount}</Badge>
            )}
          </Button>

          {/* User Account */}
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>

          {/* Mobile Menu */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden border-t p-4">
        <SmartSearch />
      </div>
    </header>
  )
}
