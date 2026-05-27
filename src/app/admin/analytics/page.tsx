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

  const revenue = totalRevenue._sum.total || 0
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
        <div className="p-8 border border-border/40 bg-background transition-colors hover:border-accent">
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
              Rs. {avgBasket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="p-8 border border-border/40 bg-background transition-colors hover:border-accent">
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
              Rs. {annualized.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="p-8 border border-border/40 bg-background transition-colors hover:border-accent">
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
              {totalUsers.toLocaleString()} Accounts
            </p>
          </div>
        </div>
      </div>

      <div className="border border-border/40 bg-background">
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
              {recentOrders.reverse().map((order, i) => {
                const maxTotal = Math.max(...recentOrders.map(o => o.total), 1)
                const heightPct = Math.max((order.total / maxTotal) * 100, 5)
                
                return (
                  <div key={order.id} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-forest/20 group-hover:bg-forest/50 transition-colors"
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute mt-[-2rem] bg-foreground text-background text-[9px] px-2 py-1 rounded">
                      Rs.{order.total.toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
