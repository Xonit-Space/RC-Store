"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, Package, Tags, Puzzle, ShoppingCart, 
  Users, Warehouse, Ticket, Wrench, Star, 
  Newspaper, Image as ImageIcon, BarChart2, Settings, LogOut,
  ChevronRight, Calculator, Truck
} from "lucide-react"

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
      { id: "customers", name: "Customers", icon: Users, path: "/admin/customers" },
      { id: "coupons", name: "Coupons", icon: Ticket, path: "/admin/coupons" },
      { id: "reviews", name: "Reviews", icon: Star, path: "/admin/reviews" },
    ],
  },
  {
    label: "Content",
    items: [
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

  return (
    <aside className="w-60 border-r border-border/40 bg-zinc-50 dark:bg-background min-h-[calc(100vh-4rem)] shrink-0 sticky top-16 hidden md:flex md:flex-col">
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary px-3 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.path === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.path)
                return (
                  <Link key={item.id} href={item.path}>
                    <div
                      className={`flex items-center gap-3 h-9 px-3 rounded-md transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(255,204,0,0.2)]"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <item.icon
                        strokeWidth={isActive ? 2 : 1.5}
                        className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`}
                      />
                      <span className={`text-xs flex-1 ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                      {isActive && (
                        <ChevronRight className="h-3 w-3 text-primary opacity-60" />
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout pinned to bottom */}
      <div className="p-3 border-t border-border/40">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 h-9 px-3 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all group"
        >
          <LogOut strokeWidth={1.5} className="h-4 w-4 shrink-0" />
          <span className="text-[12px] tracking-wide">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
