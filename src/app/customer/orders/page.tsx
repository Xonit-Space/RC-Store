"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Zap, Package, ArrowRight } from "lucide-react"
import { RefundModal } from "@/components/customer/refund-modal"
import { ReviewsModal } from "@/components/customer/reviews-modal"
import { GalleryModal } from "@/components/customer/gallery-modal"

export default function CustomerOrdersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<any>(null)

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<{ id: string, name: string } | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const ordRes = await fetch("/api/customer/orders")
      if (ordRes.ok) {
        const json = await ordRes.json()
        setOrders(json.orders || json.data || (Array.isArray(json) ? json : []))
      } else {
        toast.error("Failed to load orders")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/customer/orders")
    } else if (status === "authenticated") {
      loadOrders()
    }
  }, [status, router])

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-mono animate-pulse">
          Loading Orders...
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 md:p-12 pb-24 md:pb-32 font-sans w-full max-w-5xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 mb-12 gap-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-2 font-mono font-bold flex items-center gap-2">
            <Zap className="w-3 h-3" /> Order History
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-black text-foreground uppercase tracking-wider">
            My Orders
          </h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center glass-dark border border-white/5 rounded-xl">
          <Package className="w-16 h-16 mx-auto text-white/20 mb-6" />
          <p className="font-heading text-3xl font-black text-foreground mb-4 uppercase text-white/50">No orders found</p>
          <a href="/products" className="text-[11px] font-mono tracking-widest uppercase text-primary border-b border-primary pb-1 inline-flex items-center gap-2 group hover:text-primary/90 transition-colors">
            Start Shopping
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="glass-dark border border-white/5 rounded-xl group hover:border-racing-yellow/30 transition-all overflow-hidden relative shadow-lg">
              <div className="absolute top-0 left-0 w-1 h-full bg-racing-yellow/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Header */}
              <div className="flex flex-wrap justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                <div>
                  <p className="text-[14px] font-mono font-bold tracking-widest uppercase text-foreground mb-2">
                    Order #{order.orderNumber}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                    Placed: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right mt-4 md:mt-0">
                  <span className="inline-block mb-2 text-[10px] font-mono font-bold tracking-widest uppercase text-primary border border-primary/30 px-3 py-1 bg-primary/10 rounded">
                    {order.status}
                  </span>
                  <p className="text-xl font-heading font-black text-foreground tracking-widest">
                    {order.total.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
                  </p>
                  {order.status === "DELIVERED" && (
                    <button
                      onClick={() => {
                        setSelectedOrderForRefund(order)
                        setIsRefundModalOpen(true)
                      }}
                      className="mt-3 block w-full text-right text-[10px] text-red-500 hover:text-red-400 font-mono font-bold tracking-widest uppercase transition-colors"
                    >
                      Request Refund
                    </button>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="p-6 divide-y divide-white/5">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex flex-col md:flex-row gap-6 py-6 first:pt-0 last:pb-0 items-start md:items-center">
                    <div className="h-24 w-24 bg-black/50 shrink-0 relative overflow-hidden border border-white/10 rounded-lg">
                      <img
                        src={item.variant?.product?.images?.[0]?.url || "/placeholder.svg"}
                        alt="Item"
                        className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-500"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-heading font-bold uppercase tracking-wider text-foreground mb-2">
                        {item.variant?.product?.name}
                      </p>
                      <p className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground mb-4">
                        Spec: {item.variant?.size} | Qty: {item.quantity}
                      </p>
                      {order.status === "DELIVERED" && (
                        <div className="flex flex-wrap gap-4">
                          <button 
                            onClick={() => {
                              setSelectedProduct({ id: item.variant?.product?.id, name: item.variant?.product?.name })
                              setIsReviewModalOpen(true)
                            }}
                            className="text-[10px] font-mono uppercase font-bold text-primary hover:text-primary/80 transition-colors tracking-widest bg-primary/10 px-3 py-1.5 rounded border border-primary/20"
                          >
                            Write Review
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedProduct({ id: item.variant?.product?.id, name: item.variant?.product?.name })
                              setIsGalleryModalOpen(true)
                            }}
                            className="text-[10px] font-mono uppercase font-bold text-emerald-500 hover:text-emerald-400 transition-colors tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20"
                          >
                            Upload to Gallery
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="md:text-right mt-4 md:mt-0">
                      <p className="text-sm font-mono font-bold text-foreground tracking-widest">
                        {(item.price * item.quantity).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        onSuccess={() => {
          loadOrders()
          router.refresh()
        }}
        order={selectedOrderForRefund}
      />

      <ReviewsModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        productId={selectedProduct?.id || ""}
        productName={selectedProduct?.name || ""}
        onSuccess={() => {}}
      />

      <GalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        productId={selectedProduct?.id || ""}
        productName={selectedProduct?.name || ""}
        onSuccess={() => {}}
      />
    </div>
  )
}
