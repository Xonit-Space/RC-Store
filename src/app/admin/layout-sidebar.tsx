"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart3, Package, Users, ShoppingCart, Settings, 
  Truck, Calculator, Coins, Database, LineChart
} from "lucide-react"

interface SidebarProps {
  role: string
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const modules = [
    { id: "overview", name: "Overview", icon: BarChart3, path: "/admin" },
    { id: "pos", name: "Point of Sale (POS)", icon: Calculator, path: "/admin/pos" },
    { id: "couriers", name: "Courier Operations", icon: Truck, path: "/admin/couriers" },
    { id: "products", name: "Products Catalog", icon: Package, path: "/admin/products" },
    { id: "orders", name: "Orders Manager", icon: ShoppingCart, path: "/admin/orders" },
    { id: "customers", name: "Customers Registry", icon: Users, path: "/admin/customers" },
    { id: "inventory", name: "Inventory Stock", icon: Database, path: "/admin/inventory" },
    { id: "coupons", name: "Coupon Codes", icon: Coins, path: "/admin/coupons" },
    { id: "analytics", name: "Telemetry Charts", icon: LineChart, path: "/admin/analytics" },
    { id: "settings", name: "Platform Settings", icon: Settings, path: "/admin/settings" },
  ]

  return (
    <aside className="w-64 border-r border-border/40 bg-background min-h-[calc(100vh-4rem)] shrink-0 sticky top-16 hidden md:block">
      <nav className="p-6 space-y-1">
        <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground mb-6 pl-3">
          Modules
        </p>
        {modules.map((module) => {
          const isActive = pathname === module.path
          return (
            <Link key={module.id} href={module.path} className="block">
              <div
                className={`w-full flex items-center h-10 px-3 transition-colors ${
                  isActive 
                    ? "text-accent bg-accent/5 border-r-2 border-accent" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <module.icon strokeWidth={isActive ? 1.5 : 1} className={`h-4 w-4 mr-3 shrink-0 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                <span className={`text-[11px] tracking-wider uppercase ${isActive ? "font-medium" : "font-light"}`}>
                  {module.name}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

