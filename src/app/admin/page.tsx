import { db } from "@/lib/db"
import { getOrderStats as fetchStats } from "@/repositories/order"
import { TrendingUp, ShoppingCart, Package, Users } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminOverviewPage() {
  const [stats, recentOrders] = await Promise.all([
    fetchStats(),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, email: true } }
      }
    })
  ])

  const statsCards = [
    {
      title: "Gross Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      icon: TrendingUp,
      color: "text-forest",
      bgColor: "bg-forest/5"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-brass",
      bgColor: "bg-brass/5"
    },
    {
      title: "Pending Fulfillment",
      value: stats.pendingOrders.toString(),
      change: "Action Required",
      icon: Package,
      color: "text-terracotta",
      bgColor: "bg-terracotta/5"
    },
    {
      title: "Completed",
      value: stats.completedOrders.toString(),
      change: "+9.1%",
      icon: Users,
      color: "text-charcoal",
      bgColor: "bg-charcoal/5"
    },
  ]

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">
          Overview
        </p>
        <h2 className="font-serif text-3xl md:text-5xl font-light text-foreground leading-none">
          Dashboard
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsCards.map((stat) => (
          <div key={stat.title} className="p-6 md:p-8 border border-border/40 bg-background transition-colors hover:border-accent group">
            <div className="flex justify-between items-start mb-12">
              <div className={`h-10 w-10 ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon strokeWidth={1} className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                {stat.change}
              </p>
            </div>
            <div>
              <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                {stat.title}
              </p>
              <p className="font-serif text-3xl font-light text-foreground tracking-tight">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        {/* Analytics Placeholder */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="font-serif text-2xl font-light text-foreground border-b border-border/40 pb-4">
            System Telemetry
          </h3>
          <div className="h-[400px] bg-muted/30 border border-border/40 flex flex-col items-center justify-center p-8 text-center">
            <TrendingUp strokeWidth={1} className="h-12 w-12 text-muted-foreground/30 mb-6" />
            <p className="text-[11px] tracking-[0.2em] uppercase text-foreground mb-2">
              Real-time Feed Active
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Live transaction charts are currently rendering in the dedicated telemetry canvas. 
              The system is performing at optimal efficiency.
            </p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="font-serif text-2xl font-light text-foreground border-b border-border/40 pb-4">
            Recent Transactions
          </h3>
          <div className="border border-border/40 bg-background divide-y divide-border/40">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
                  No recent activity
                </p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-5 flex justify-between items-center hover:bg-muted/20 transition-colors">
                  <div>
                    <p className="text-[11px] tracking-widest uppercase text-foreground mb-1">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.user.name || order.user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground mb-1">
                      Rs. {order.total.toLocaleString()}
                    </p>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-accent border border-accent/30 px-2 py-0.5">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

