"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ShoppingBag, RefreshCw, Calendar, ChevronRight, Home, CreditCard } from "lucide-react"
import Image from "next/image"

export default function CustomerOrdersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/customer/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data || [])
      } else {
        toast.error("Failed to load customer orders log")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/customer/orders")
    } else if (status === "authenticated") {
      fetchOrders()
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
                <div className="flex-grow flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            <span className="text-sm font-bold text-muted/50">Loading orders...</span>
          </div>
        </div>
              </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between text-foreground font-sans">
      
      <main className="flex-grow container mx-auto px-4 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          <a href="/customer" className="hover:text-primary transition flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Dashboard</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/70">My Orders</span>
        </div>

        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight leading-snug">My Order History</h2>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">Track, audit, or request return logs for placed purchases.</p>
          </div>
          <ShoppingBag className="w-8 h-8 text-primary" />
        </div>

        {orders.length === 0 ? (
          <Card className="border border-dashed border-border/40 p-12 text-center rounded-none">
            <CardContent className="pt-6">
              <ShoppingBag className="h-14 w-14 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-bold text-foreground">No purchases found</p>
              <p className="text-xs text-muted-foreground pt-1 mb-6">You have not completed any checkouts yet.</p>
              <a href="/products" className="inline-flex h-11 items-center justify-center px-6 rounded-none bg-primary hover:bg-primary/95 text-foreground text-xs font-bold transition">
                Browse Products
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border border-muted/10 rounded-none shadow-sm overflow-hidden bg-card transition hover:border-border/40">
                <div className="flex flex-col sm:flex-row justify-between bg-muted/5 border-b border-muted/10 p-4 gap-2">
                  <div>
                    <p className="font-extrabold text-foreground text-xs uppercase tracking-wide">
                      ORDER {order.orderNumber}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3 w-3" /> Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="secondary" className="text-[10px] font-extrabold py-0.5 px-2 bg-foreground text-foreground uppercase">
                      {order.status}
                    </Badge>
                    <span className="text-sm font-extrabold text-foreground">
                      Total: Rs. {Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0 border-muted/10">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-none bg-muted/10 flex items-center justify-center shrink-0 overflow-hidden border border-border/40">
                          {item.variant?.product?.images?.[0]?.url ? (
                            <Image src={item.variant.product.images[0].url} alt={item.variant?.product?.name || "Product"} fill sizes="48px" className="object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground leading-snug">{item.variant?.product?.name || "Product SKU variant"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-bold">
                            Qty: {item.quantity} × Rs. {Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-foreground/70">
                        Rs. {(item.quantity * Number(item.price)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

          </div>
  )
}
