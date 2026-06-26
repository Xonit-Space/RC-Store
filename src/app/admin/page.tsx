import { db } from "@/lib/db"
import { getOrderStats as fetchStats } from "@/repositories/order"
import { 
  TrendingUp, ShoppingCart, Package, Users, Activity, 
  Warehouse, Star, ArrowRight, AlertTriangle, CheckCircle
} from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  PROCESSING: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  SHIPPED: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  DELIVERED: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  COMPLETED: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  CANCELLED: "text-red-500 bg-red-500/10 border-red-500/30",
}

export default async function AdminOverviewPage() {
  const [stats, recentOrders] = await Promise.all([
    fetchStats(),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { name: true, email: true } }
      }
    })
  ])

  const kpiCards = [
    {
      label: "Total Revenue",
      value: `Rs. ${Number(stats.totalRevenue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: "Lifetime earnings",
      icon: TrendingUp,
      color: "text-primary",
      border: "border-primary/20",
      bg: "bg-primary/5",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      sub: `${stats.completedOrders} completed`,
      icon: ShoppingCart,
      color: "text-blue-500",
      border: "border-blue-500/20",
      bg: "bg-blue-500/5",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders.toString(),
      sub: stats.pendingOrders > 0 ? "Requires action" : "All clear",
      icon: Package,
      color: stats.pendingOrders > 0 ? "text-amber-500" : "text-emerald-500",
      border: stats.pendingOrders > 0 ? "border-amber-500/30" : "border-emerald-500/20",
      bg: stats.pendingOrders > 0 ? "bg-amber-500/5" : "bg-emerald-500/5",
    },
    {
      label: "Registered Users",
      value: stats.totalUsers.toString(),
      sub: "Total customers",
      icon: Users,
      color: "text-purple-500",
      border: "border-purple-500/20",
      bg: "bg-purple-500/5",
    },
  ]

  const quickActions = [
    { label: "Add Product", description: "Create a new RC product listing", href: "/admin/products", icon: Package, color: "text-blue-500" },
    { label: "Manage Orders", description: "View and process customer orders", href: "/admin/orders", icon: ShoppingCart, color: "text-amber-500", badge: stats.pendingOrders > 0 ? stats.pendingOrders : null },
    { label: "Stock Levels", description: `${stats.lowStockCount} variants need restocking`, href: "/admin/inventory", icon: Warehouse, color: "text-red-500", badge: stats.lowStockCount > 0 ? stats.lowStockCount : null },
    { label: "Review Queue", description: "Moderate customer reviews", href: "/admin/reviews", icon: Star, color: "text-primary" },
    { label: "Customers", description: "Browse customer registry", href: "/admin/customers", icon: Users, color: "text-purple-500" },
    { label: "Analytics", description: "View store performance charts", href: "/admin/analytics", icon: Activity, color: "text-emerald-500" },
  ]

  const fulfillmentRate = stats.totalOrders > 0 
    ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) 
    : "0.0"

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-end justify-between border-b border-border/40 pb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1 font-medium">
            Overview
          </p>
          <h2 className="text-2xl font-semibold text-foreground">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"} 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s what&apos;s happening in your store today.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              System Online
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground tracking-wide mt-0.5">
            Fulfillment rate: {fulfillmentRate}%
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`p-5 border ${card.border} ${card.bg} rounded-lg relative overflow-hidden group hover:shadow-sm transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`h-9 w-9 ${card.bg} border ${card.border} flex items-center justify-center rounded-md`}>
                <card.icon strokeWidth={1.5} className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground leading-none mb-1">
              {card.value}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {card.label}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Main content: Quick Actions + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Quick Actions */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-4 p-4 border border-border/40 bg-background hover:bg-muted/30 hover:border-border/70 rounded-lg transition-all group"
              >
                <div className={`h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors`}>
                  <action.icon strokeWidth={1.5} className={`h-4 w-4 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{action.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {action.badge && (
                    <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {action.badge}
                    </span>
                  )}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="border border-border/40 rounded-lg bg-background overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  No orders yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recentOrders.map((order) => {
                  const statusColor = ORDER_STATUS_COLORS[order.status] || "text-muted-foreground bg-muted/30 border-border/30"
                  return (
                    <Link
                      key={order.id}
                      href={`/admin/orders`}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          #{order.orderNumber}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {order.user.name || order.user.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 border rounded-sm ${statusColor}`}>
                          {order.status}
                        </span>
                        <p className="text-sm font-bold text-foreground hidden sm:block">
                          Rs. {Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Inventory Alert Bar */}
          {stats.lowStockCount > 0 && (
            <Link
              href="/admin/inventory"
              className="flex items-center gap-3 p-4 border border-amber-500/30 bg-amber-500/5 rounded-lg hover:bg-amber-500/10 transition-colors group"
            >
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-400 flex-1">
                <span className="font-bold">{stats.lowStockCount} variants</span> are running low on stock and need restocking.
              </p>
              <ArrowRight className="h-3.5 w-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          )}
          {stats.lowStockCount === 0 && (
            <div className="flex items-center gap-3 p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                All inventory levels are healthy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
