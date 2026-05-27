"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ShoppingBag, RefreshCw, Calendar, ChevronRight, Home, CreditCard } from "lucide-react"

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
        <Header />
        <div className="flex-grow flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            <span className="text-sm font-bold text-slate-500">Loading orders...</span>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between text-slate-800 font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          <a href="/customer" className="hover:text-primary transition flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Dashboard</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600">My Orders</span>
        </div>

        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-snug">My Order History</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Track, audit, or request return logs for placed purchases.</p>
          </div>
          <ShoppingBag className="w-8 h-8 text-primary" />
        </div>

        {orders.length === 0 ? (
          <Card className="border border-dashed border-slate-200 p-12 text-center rounded-2xl">
            <CardContent className="pt-6">
              <ShoppingBag className="h-14 w-14 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700">No purchases found</p>
              <p className="text-xs text-muted-foreground pt-1 mb-6">You have not completed any checkouts yet.</p>
              <a href="/products" className="inline-flex h-11 items-center justify-center px-6 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-bold transition">
                Browse Products
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border border-slate-100 rounded-2xl shadow-sm overflow-hidden bg-card transition hover:border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between bg-slate-50 border-b border-slate-100 p-4 gap-2">
                  <div>
                    <p className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                      ORDER {order.orderNumber}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3 w-3" /> Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="secondary" className="text-[10px] font-extrabold py-0.5 px-2 bg-blue-100 text-blue-800 uppercase">
                      {order.status}
                    </Badge>
                    <span className="text-sm font-extrabold text-blue-600">
                      Total: Rs. {order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                          {item.variant?.product?.images?.[0]?.url ? (
                            <img src={item.variant.product.images[0].url} alt="" className="object-cover h-full w-full" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700 leading-snug">{item.variant?.product?.name || "Product SKU variant"}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                            Qty: {item.quantity} × Rs. {item.price}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-600">
                        Rs. {(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
