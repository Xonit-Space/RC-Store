"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { 
  LayoutDashboard, Package, Tags, Puzzle, ShoppingCart, 
  Users, Warehouse, Ticket, Wrench, Star, 
  Newspaper, Image as ImageIcon, BarChart2, Settings, LogOut,
  ChevronRight, Calculator, Truck, ChevronLeft, Menu
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  role: string
}

const navGroups = [
  {
    label: "Overview",
    items: [
      { id: "overview", name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
      { id: "analytics", name: "Analytics", icon: BarChart2, path: "/admin/analytics" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { id: "products", name: "Products", icon: Package, path: "/admin/products" },
      { id: "categories", name: "Categories", icon: Tags, path: "/admin/categories" },
      { id: "addons", name: "Addons", icon: Puzzle, path: "/admin/addons" },
      { id: "inventory", name: "Inventory", icon: Warehouse, path: "/admin/inventory" },
      { id: "part-finder", name: "Part Finder", icon: Wrench, path: "/admin/part-finder" },
    ],
  },
  {
    label: "Sales",
    items: [
      { id: "orders", name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
      { id: "refunds", name: "Refunds", icon: ShoppingCart, path: "/admin/refunds" },
      { id: "customers", name: "Customers", icon: Users, path: "/admin/customers" },
      { id: "coupons", name: "Coupons", icon: Ticket, path: "/admin/coupons" },
      { id: "reviews", name: "Reviews", icon: Star, path: "/admin/reviews" },
    ],
  },
  {
    label: "Content",
    items: [
      { id: "banners", name: "Banners", icon: ImageIcon, path: "/admin/banners" },
      { id: "blog", name: "Blog", icon: Newspaper, path: "/admin/blog" },
      { id: "gallery", name: "Gallery", icon: ImageIcon, path: "/admin/gallery" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "settings", name: "Settings", icon: Settings, path: "/admin/settings" },
      { id: "tax", name: "Tax Rates", icon: Calculator, path: "/admin/settings/tax" },
      { id: "shipping", name: "Shipping Rules", icon: Truck, path: "/admin/settings/shipping" },
    ],
  },
]

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false) // Mobile open state
  const [isExpanded, setIsExpanded] = useState(true) // Desktop expand/collapse state

  return (
    <TooltipProvider>
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 bg-primary text-black hover:bg-primary/90 transition-colors rounded-full shadow-[0_0_15px_rgba(255,204,0,0.5)]"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-40
        border-r border-border/40 bg-zinc-50 dark:bg-background shrink-0 
        flex flex-col transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-64' : 'w-20'}
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Toggle Expand/Collapse (Desktop) */}
        <div className={`p-4 border-b border-border/40 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          {isExpanded && (
            <span className="font-heading text-lg font-black uppercase text-foreground tracking-widest whitespace-nowrap overflow-hidden px-2">
              Command
            </span>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden md:flex p-1.5 hover:bg-border/40 rounded-md text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4 overflow-x-hidden custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-2">
              {isExpanded ? (
                <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-primary px-3 mb-2">
                  {group.label}
                </p>
              ) : (
                <div className="w-full flex justify-center mb-2">
                  <div className="w-6 h-[1px] bg-border/40" />
                </div>
              )}
              
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.path === "/admin" || item.path === "/admin/settings"
                    ? pathname === item.path
                    : pathname.startsWith(item.path)
                  
                  const linkContent = (
                    <Link key={item.id} href={item.path} onClick={() => setIsOpen(false)}>
                      <div
                        className={`flex items-center h-10 rounded-md transition-all whitespace-nowrap overflow-hidden
                          ${isExpanded ? 'px-3 gap-3' : 'justify-center'}
                          ${isActive
                            ? "bg-primary/10 text-primary shadow-[inset_3px_0_0_0_rgba(255,204,0,1)]"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                      >
                        <item.icon
                          strokeWidth={isActive ? 2 : 1.5}
                          className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`}
                        />
                        {isExpanded && (
                          <>
                            <span className={`text-[11px] uppercase tracking-widest flex-1 ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                            {isActive && <ChevronRight className="h-3 w-3 text-primary opacity-60 shrink-0" />}
                          </>
                        )}
                      </div>
                    </Link>
                  )

                  if (!isExpanded) {
                    return (
                      <Tooltip key={item.id} delayDuration={0}>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-[10px] font-bold tracking-widest uppercase border border-border/40 bg-background text-foreground ml-2">
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return linkContent
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout pinned to bottom */}
        <div className="p-3 border-t border-border/40">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className={`w-full flex items-center h-10 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all group overflow-hidden whitespace-nowrap
                  ${isExpanded ? 'gap-3 px-3' : 'justify-center'}
                `}
              >
                <LogOut strokeWidth={1.5} className="h-4 w-4 shrink-0" />
                {isExpanded && (
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sign Out</span>
                )}
              </button>
            </TooltipTrigger>
            {!isExpanded && (
              <TooltipContent side="right" className="text-[10px] font-bold tracking-widest uppercase border border-red-500/30 bg-background text-red-500 ml-2">
                Sign Out
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}
