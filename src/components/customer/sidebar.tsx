"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, MapPin, Star, Image as ImageIcon, Settings, LogOut, Menu, Zap, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useCartStore } from "@/store/cart"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { name: "Overview", href: "/customer", icon: LayoutDashboard },
  { name: "My Orders", href: "/customer/orders", icon: ShoppingBag },
  { name: "Addresses", href: "/customer/addresses", icon: MapPin },
  { name: "Reviews", href: "/customer/reviews", icon: Star },
  { name: "Gallery", href: "/customer/gallery", icon: ImageIcon },
  { name: "Wishlist", href: "/customer/wishlist", icon: Heart },
  { name: "Settings", href: "/customer/profile", icon: Settings },
]

export function CustomerSidebar() {
  const pathname = usePathname()
  const cartStore = useCartStore()
  const [isOpen, setIsOpen] = useState(false) // Mobile open state
  const [isExpanded, setIsExpanded] = useState(true) // Desktop expand/collapse state

  return (
    <TooltipProvider>
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
        glass-dark border-r border-racing-yellow/20
        flex flex-col transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-64' : 'w-20'}
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Header */}
        <div className={`p-6 border-b border-white/5 flex items-center justify-between ${!isExpanded ? 'flex-col gap-4' : ''}`}>
          <Link href="/" className="flex items-center gap-2 group">
            <Zap className="w-5 h-5 text-primary group-hover:scale-110 transition-transform shrink-0" />
            {isExpanded && (
              <span className="font-heading text-xl font-black uppercase text-foreground tracking-widest whitespace-nowrap overflow-hidden">
                My Garage
              </span>
            )}
          </Link>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden lg:flex p-1.5 hover:bg-white/10 rounded-md text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/customer" && pathname.startsWith(item.href))
            const Icon = item.icon

            const linkContent = (
              <Link 
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center px-3 py-3 rounded-md transition-all whitespace-nowrap overflow-hidden
                  ${isExpanded ? 'gap-4' : 'justify-center'}
                  ${isActive 
                    ? "bg-racing-yellow/10 text-primary font-bold shadow-[inset_3px_0_0_0_rgba(255,204,0,1)]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "opacity-70"}`} strokeWidth={isActive ? 2.5 : 1.5} />
                {isExpanded && (
                  <span className="text-[11px] font-mono tracking-widest uppercase">{item.name}</span>
                )}
              </Link>
            )

            if (!isExpanded) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-[10px] font-mono tracking-widest uppercase border border-border/40 bg-background text-foreground ml-2">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.href}>{linkContent}</div>
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-white/5">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  cartStore.clearCart()
                  signOut({ callbackUrl: "/login" })
                }}
                className={`
                  flex w-full items-center px-3 py-3 rounded-md text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all overflow-hidden whitespace-nowrap
                  ${isExpanded ? 'gap-4' : 'justify-center'}
                `}
              >
                <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                {isExpanded && (
                  <span className="text-[11px] font-mono tracking-widest uppercase">Log Out</span>
                )}
              </button>
            </TooltipTrigger>
            {!isExpanded && (
              <TooltipContent side="right" className="text-[10px] font-mono tracking-widest uppercase border border-red-500/30 bg-background text-red-500 ml-2">
                Log Out
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}
