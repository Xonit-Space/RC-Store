import { db } from "@/lib/db"
import { getOrderStats as fetchStats } from "@/repositories/order"
import { TrendingUp, ShoppingCart, Package, Users, Activity, Radar, Cpu } from "lucide-react"

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
      title: "Revenue Output",
      value: `Rs. ${Number(stats.totalRevenue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+12.5% THRUST",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-racing-yellow/10"
    },
    {
      title: "Active Orders",
      value: stats.totalOrders.toString(),
      change: "+8.2% ONLINE",
      icon: ShoppingCart,
      color: "text-foreground",
      bgColor: "bg-muted/50"
    },
    {
      title: "Pending Fulfillment",
      value: stats.pendingOrders.toString(),
      change: "WARNING: ACTION REQ",
      icon: Package,
      color: "text-primary animate-pulse",
      bgColor: "bg-racing-yellow/20 border border-primary"
    },
    {
      title: "System Users",
      value: stats.totalUsers.toString(),
      change: "REGISTERED",
      icon: Users,
      color: "text-muted-foreground",
      bgColor: "bg-gray-800"
    },
  ]

  const fulfillmentEfficiency = stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : "0.0"

  return (
    <div className="space-y-12 fade-up-section visible">
      {/* Header */}
      <div className="border-b border-border pb-6 mb-8 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <p className="text-[10px] tracking-[0.4em] uppercase text-primary font-mono font-bold">
              SYSTEM ONLINE // TERMINAL: ALPHA
            </p>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-foreground leading-none uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255, 204, 0,0.3)]">
            Control Center
          </h2>
        </div>
        <div className="hidden md:block">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest text-right">
            Status: <span className="text-green-500 font-bold">NOMINAL</span>
          </p>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest text-right">
            Uptime: <span className="text-foreground">99.9%</span>
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsCards.map((stat) => (
          <div key={stat.title} className="p-6 md:p-8 border border-border bg-background transition-all hover:border-primary hover:shadow-[0_0_20px_rgba(255, 204, 0,0.15)] group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-racing-yellow/10 to-transparent pointer-events-none" />
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className={`h-10 w-10 ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon strokeWidth={2} className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground group-hover:text-racing-yellow transition-colors">
                {stat.change}
              </p>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground mb-2">
                {stat.title}
              </p>
              <p className="font-heading text-3xl md:text-4xl font-black text-foreground tracking-tighter">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        {/* System Analytics */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="font-heading text-2xl font-black text-foreground border-b border-border pb-4 uppercase tracking-widest flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" />
            Telemetry Data
          </h3>
          <div className="border border-border bg-background overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="p-6 md:p-8 bg-muted border-b border-border relative">
               <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
               <div className="flex justify-between items-center relative z-10">
                 <div>
                   <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-1">
                     Gross Output Volume
                   </p>
                   <p className="font-heading text-2xl font-black text-foreground uppercase">
                     {stats.totalOrders} UNITS DISPATCHED
                   </p>
                 </div>
                 <Cpu strokeWidth={1} className="h-10 w-10 text-primary opacity-50" />
               </div>
            </div>
            <div className="p-6 md:p-8 grid grid-cols-2 gap-4">
               <div>
                 <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-1">Fulfillment Efficiency</p>
                 <p className="font-heading text-xl font-bold text-foreground tracking-widest">{fulfillmentEfficiency}%</p>
               </div>
               <div>
                 <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-1">Low Stock Alerts</p>
                 <p className="font-heading text-xl font-bold text-primary tracking-widest">{stats.lowStockCount} VARIANTS</p>
               </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="font-heading text-2xl font-black text-foreground border-b border-border pb-4 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Logs
          </h3>
          <div className="border border-border bg-background divide-y divide-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                  NO RECENT ACTIVITY DETECTED
                </p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-5 flex justify-between items-center hover:bg-smoke-dark transition-colors group">
                  <div>
                    <p className="text-[11px] font-mono font-bold tracking-widest uppercase text-foreground mb-1 group-hover:text-racing-yellow transition-colors">
                      TRX_{order.orderNumber}
                    </p>
                    <p className="text-sm font-sans text-muted-foreground">
                      {order.user.name || order.user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-foreground mb-1">
                      Rs. {Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className={`text-[9px] font-mono font-bold tracking-[0.2em] uppercase px-2 py-0.5 border ${
                      order.status === "PENDING" ? "text-primary border-racing-yellow/50 bg-racing-yellow/10" : "text-green-500 border-green-500/50 bg-green-500/10"
                    }`}>
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

