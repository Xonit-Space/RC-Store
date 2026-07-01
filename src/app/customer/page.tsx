"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Zap, Package, Award, Wallet, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useCustomer } from "@/components/providers/customer-provider"

export default function CustomerDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { profile } = useCustomer()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/customer")
    } else if (status === "authenticated") {
      const loadOrders = async () => {
        try {
          const ordRes = await fetch("/api/customer/orders?limit=3") // only fetch 3
          if (ordRes.ok) {
            const json = await ordRes.json()
            setOrders(json.orders || json.data || (Array.isArray(json) ? json : []))
          }
        } catch (error) {
          console.error(error)
        } finally {
          setLoading(false)
        }
      }
      loadOrders()
    }
  }, [status, router])

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-mono animate-pulse">
          Loading...
        </p>
      </div>
    )
  }

  const primaryAddress = profile?.addresses?.find((a: any) => a.isDefaultShipping) || profile?.addresses?.[0]

  return (
    <div className="flex-1 p-6 md:p-12 pb-24 md:pb-32 font-sans w-full max-w-5xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 mb-12 gap-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-2 font-mono font-bold flex items-center gap-2">
            <Zap className="w-3 h-3" /> Dashboard Overview
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-black text-foreground uppercase tracking-wider">
            Hello, {profile?.name || "Pilot"}
          </h1>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        <div className="p-6 glass-dark border border-white/5 rounded-xl shadow-lg relative overflow-hidden group hover:border-racing-yellow/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <Package className="w-16 h-16 text-racing-yellow" />
          </div>
          <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-4">Total Orders</p>
          <p className="font-heading text-4xl font-black text-foreground">{orders.length}</p>
        </div>
        
        <div className="p-6 glass-dark border border-white/5 rounded-xl shadow-lg relative overflow-hidden group hover:border-racing-yellow/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <Award className="w-16 h-16 text-racing-yellow" />
          </div>
          <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-4">Loyalty Points</p>
          <p className="font-heading text-4xl font-black text-foreground text-transparent bg-clip-text bg-gradient-to-r from-racing-yellow to-amber-500">
            {profile?.loyaltyPoint?.pointsBalance || 0}
          </p>
        </div>

        <div className="p-6 glass-dark border border-white/5 rounded-xl shadow-lg relative overflow-hidden group hover:border-racing-yellow/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <Wallet className="w-16 h-16 text-racing-yellow" />
          </div>
          <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-4">Store Credit</p>
          <p className="font-heading text-4xl font-black text-foreground">
            {Number(profile?.storeCredits?.[0]?.balance || 0).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Snapshot */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-[11px] font-mono font-bold tracking-widest uppercase text-foreground">
              Recent Orders
            </h3>
            <Link href="/customer/orders" className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center glass-dark border border-white/5 rounded-xl">
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">No recent orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="glass-dark border border-white/5 p-5 rounded-xl flex items-center justify-between hover:border-racing-yellow/20 transition-colors">
                  <div>
                    <p className="text-[11px] font-mono font-bold uppercase tracking-widest mb-1 text-foreground">#{order.orderNumber}</p>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-[9px] font-mono font-bold tracking-widest uppercase text-primary mb-1 border border-primary/30 bg-primary/10 px-2 py-0.5 rounded">
                      {order.status}
                    </span>
                    <p className="font-heading font-black text-sm">{order.total.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Primary Address Snapshot */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-[11px] font-mono font-bold tracking-widest uppercase text-foreground">
              Primary Address
            </h3>
            <Link href="/customer/addresses" className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {!primaryAddress ? (
            <div className="py-12 text-center glass-dark border border-white/5 rounded-xl">
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">No addresses saved</p>
            </div>
          ) : (
            <div className="glass-dark border border-white/5 p-6 rounded-xl">
              <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-foreground mb-3">{primaryAddress.title}</p>
              <div className="text-xs font-mono text-muted-foreground leading-relaxed uppercase space-y-1">
                <p>{primaryAddress.line1}</p>
                {primaryAddress.line2 && <p>{primaryAddress.line2}</p>}
                <p>{primaryAddress.city}, {primaryAddress.state} {primaryAddress.postalCode}</p>
                <p>{primaryAddress.country}</p>
                <p className="pt-2 tracking-widest">{primaryAddress.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
