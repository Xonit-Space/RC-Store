"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, MapPin, Star, Image as ImageIcon, Settings, LogOut, Menu, Zap } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useCartStore } from "@/store/cart"
import { useState } from "react"

const navItems = [
  { name: "Overview", href: "/customer", icon: LayoutDashboard },
  { name: "My Orders", href: "/customer/orders", icon: ShoppingBag },
  { name: "Addresses", href: "/customer/addresses", icon: MapPin },
  { name: "Reviews", href: "/customer/reviews", icon: Star },
  { name: "Gallery", href: "/customer/gallery", icon: ImageIcon },
  { name: "Settings", href: "/customer/profile", icon: Settings },
]

export function CustomerSidebar() {
  const pathname = usePathname()
  const cartStore = useCartStore()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-[120px] right-6 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-background border border-racing-yellow/30 text-primary hover:bg-racing-yellow/10 transition-colors rounded-full shadow-[0_0_15px_rgba(255,204,0,0.2)]"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed lg:sticky top-[104px] left-0 h-[calc(100vh-104px)] z-40
        w-64 glass-dark border-r border-racing-yellow/20
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Header */}
        <div className="p-8 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 group">
            <Zap className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-heading text-xl font-black uppercase text-foreground tracking-widest">
              My Garage
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/customer" && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3 text-[11px] font-mono tracking-widest uppercase transition-all
                  ${isActive 
                    ? "bg-racing-yellow/10 text-primary border-l-2 border-primary font-bold" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border-l-2 border-transparent"
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "opacity-70"}`} strokeWidth={isActive ? 2.5 : 1.5} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-6 border-t border-white/5">
          <button
            onClick={() => {
              cartStore.clearCart()
              signOut({ callbackUrl: "/login" })
            }}
            className="flex w-full items-center gap-4 px-4 py-3 text-[11px] font-mono tracking-widest uppercase text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all border-l-2 border-transparent hover:border-red-500"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  )
}
