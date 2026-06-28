import { db } from "@/lib/db"
import { TrendingUp, DollarSign, Users, BarChart2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminAnalyticsPage() {
  // Real DB aggregations
  const [totalRevenue, totalOrders, totalUsers, recentOrders] = await Promise.all([
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { notIn: ["CANCELLED", "REFUNDED"] } }
    }),
    db.order.count({
      where: { status: { notIn: ["CANCELLED", "REFUNDED"] } }
    }),
    db.user.count({
      where: { role: "CUSTOMER" }
    }),
    db.order.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      select: { id: true, total: true, createdAt: true }
    })
  ])

  const revenue = Number(totalRevenue._sum.total || 0)
  const avgBasket = totalOrders > 0 ? revenue / totalOrders : 0
  const annualized = revenue > 0 ? revenue * 12 : 0

  return (
    <div className="space-y-12">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">
          Telemetry
        </p>
        <h2 className="font-sans text-3xl md:text-5xl font-light text-foreground leading-none">
          Analytics
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_40px_rgba(255,204,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_50px_rgba(255,204,0,0.3)] hover:border-racing-yellow/50 transition-all duration-300 transition-colors hover:border-accent">
          <div className="flex justify-between items-start mb-12">
            <div className="h-10 w-10 bg-brass/5 flex items-center justify-center">
              <DollarSign strokeWidth={1} className="h-5 w-5 text-brass" />
            </div>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
              Average Basket Value
            </p>
            <p className="font-sans text-3xl font-light text-foreground tracking-tight">
              {avgBasket.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
            </p>
          </div>
        </div>

        <div className="p-8 bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_40px_rgba(255,204,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_50px_rgba(255,204,0,0.3)] hover:border-racing-yellow/50 transition-all duration-300 transition-colors hover:border-accent">
          <div className="flex justify-between items-start mb-12">
            <div className="h-10 w-10 bg-forest/5 flex items-center justify-center">
              <TrendingUp strokeWidth={1} className="h-5 w-5 text-forest" />
            </div>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
              Annualized Run Rate
            </p>
            <p className="font-sans text-3xl font-light text-foreground tracking-tight">
              {annualized.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
            </p>
          </div>
        </div>

        <div className="p-8 bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_40px_rgba(255,204,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_50px_rgba(255,204,0,0.3)] hover:border-racing-yellow/50 transition-all duration-300 transition-colors hover:border-accent">
          <div className="flex justify-between items-start mb-12">
            <div className="h-10 w-10 bg-charcoal/5 flex items-center justify-center">
              <Users strokeWidth={1} className="h-5 w-5 text-charcoal" />
            </div>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
              Registered Clients
            </p>
            <p className="font-sans text-3xl font-light text-foreground tracking-tight">
              {totalUsers.toLocaleString("en-AU", { style: 'currency', currency: 'AUD' })} Accounts
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_40px_rgba(255,204,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_50px_rgba(255,204,0,0.3)] hover:border-racing-yellow/50 transition-all duration-300">
        <div className="border-b border-border/40 p-6 md:p-8">
          <h3 className="font-sans text-2xl font-light text-foreground">Revenue Activity</h3>
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2">Latest 12 Transactions</p>
        </div>
        <div className="p-6 md:p-8">
          {recentOrders.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <BarChart2 strokeWidth={1} className="h-10 w-10 text-muted-foreground/30 mb-4" />
              <p className="text-xs text-muted-foreground font-semibold">No recent transactions recorded</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-48 w-full">
              {(() => {
                const maxTotal = Math.max(...recentOrders.map(o => Number(o.total?.toString() || 0)), 1)
                return [...recentOrders].reverse().map((order) => {
                  const heightPct = Math.max((Number(order.total?.toString() || 0) / maxTotal) * 100, 5)
                  
                  return (
                    <div key={order.id} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-foreground text-background text-[9px] px-2 py-1 rounded whitespace-nowrap z-10">
                        {Number(order.total?.toString() || 0).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
                      </div>
                      <div 
                        className="w-full bg-primary/20 group-hover:bg-primary/50 transition-colors rounded-t-sm"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
