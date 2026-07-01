"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { addCustomerAddress } from "@/actions/auth"
import { Plus, X, ArrowRight, Zap, Target } from "lucide-react"
import { toast } from "sonner"
import { useLoading } from "@/components/providers/loading-provider"
import { useCustomer } from "@/components/providers/customer-provider"
import { useCartStore } from "@/store/cart"
import { AddressModal } from "@/components/customer/address-modal"
import { RefundModal } from "@/components/customer/refund-modal"
import { ReviewsModal } from "@/components/customer/reviews-modal"
import { GalleryModal } from "@/components/customer/gallery-modal"

export default function CustomerDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { withLoading } = useLoading()
  const { profile } = useCustomer()
  const cartStore = useCartStore()

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<any>(null)

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<{ id: string, name: string } | null>(null)

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const ordRes = await fetch("/api/customer/orders")
      if (ordRes.ok) {
        const json = await ordRes.json()
        setOrders(json.orders || json.data || (Array.isArray(json) ? json : []))
      } else {
        toast.error("Failed to load data")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/customer")
    } else if (status === "authenticated") {
      loadDashboardData()
    }
  }, [status])

  const handleSetDefaultAddress = async (id: string, isShipping: boolean, isBilling: boolean) => {
    try {
      const res = await fetch(`/api/customer/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefaultShipping: isShipping, isDefaultBilling: isBilling })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Default address updated")
        loadDashboardData()
        router.refresh()
      } else {
        toast.error(data.error || "Failed to update default address")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return
    try {
      const res = await fetch(`/api/customer/addresses/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success("Address deleted")
        loadDashboardData()
        router.refresh()
      } else {
        toast.error(data.error || "Failed to delete address")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
                <div className="flex-1 flex items-center justify-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-mono animate-pulse">
            Loading Dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      
      <main className="flex-1 container mx-auto px-6 md:px-12 py-24 md:py-32 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-racing-yellow/40 pb-12 mb-16 gap-8">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-4 font-mono font-bold flex items-center gap-2">
              <Zap className="w-3 h-3" /> My Profile
            </p>
            <h1 className="font-heading text-4xl md:text-6xl font-black text-foreground leading-none uppercase drop-shadow-[0_0_10px_rgba(255, 204, 0,0.3)]">
              Welcome, {profile?.name || "Pilot"}
            </h1>
            <p className="text-sm font-mono text-muted-foreground mt-4 uppercase">ID: {profile?.email}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => {
                cartStore.clearCart()
                signOut({ callbackUrl: "/login" })
              }}
              className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1"
            >
              Log Out
            </button>
            <div className="flex gap-2">
              <a
                href="/customer/reviews"
                className="mt-4 px-4 py-2 border border-muted-foreground text-muted-foreground text-[10px] font-bold font-mono tracking-widest uppercase hover:bg-muted-foreground hover:text-background transition-colors"
              >
                Manage Reviews
              </a>
              <a
                href="/customer/gallery"
                className="mt-4 px-4 py-2 bg-primary/10 border border-primary text-primary text-[10px] font-bold font-mono tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Upload to Gallery
              </a>
            </div>
          </div>
        </div>

        {/* Members Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="p-8 glass-dark border border-racing-yellow/20 hover:border-racing-yellow/50 transition-colors group">
            <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground mb-6 group-hover:text-racing-yellow transition-colors">Order History</p>
            <p className="font-heading text-4xl font-black text-foreground">{orders.length}</p>
            <p className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground mt-1">Total Orders</p>
          </div>
          <div className="p-8 glass-dark border border-racing-yellow/20 hover:border-racing-yellow/50 transition-colors group">
            <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground mb-6 group-hover:text-racing-yellow transition-colors">Loyalty Points</p>
            <p className="font-heading text-4xl font-black text-foreground text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{profile?.loyaltyPoint?.pointsBalance || 0}</p>
            <p className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground mt-1">Points Balance</p>
          </div>
          <div className="p-8 glass-dark border border-racing-yellow/20 hover:border-racing-yellow/50 transition-colors group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-racing-yellow/10 rounded-full blur-xl group-hover:bg-racing-yellow/20 transition-colors" />
            <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground mb-6 group-hover:text-racing-yellow transition-colors">Store Credit</p>
            <p className="font-heading text-4xl font-black text-foreground">{Number(profile?.storeCredits?.[0]?.balance || 0).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</p>
            <p className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground mt-1">Available Balance</p>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Order History */}
          <div className="lg:col-span-8 space-y-8">
            <h3 className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-foreground border-b border-racing-yellow/40 pb-4">
              Recent Orders
            </h3>

            {orders.length === 0 ? (
              <div className="py-16 text-center glass-dark border border-racing-yellow/20">
                <p className="font-heading text-2xl font-black text-foreground mb-4 uppercase text-muted-foreground">No orders found</p>
                <a href="/products" className="text-[11px] font-mono tracking-[0.2em] uppercase text-primary border-b border-primary pb-1 inline-flex items-center gap-2 group hover:text-primary/90 transition-colors">
                  Continue Shopping
                  <ArrowRight strokeWidth={1.5} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="glass-dark border border-border group hover:border-racing-yellow/50 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-racing-yellow/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-border bg-muted/50">
                      <div>
                        <p className="text-[11px] font-mono font-bold tracking-widest uppercase text-foreground mb-1">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
                          Order Date: 2026-05-27
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block mb-1 text-[9px] font-mono font-bold tracking-[0.25em] uppercase text-primary border border-racing-yellow/30 px-2 py-0.5 bg-racing-yellow/5">
                          {order.status}
                        </span>
                        <p className="text-sm font-heading font-black text-foreground tracking-widest">
                          {order.total.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
                        </p>
                        {order.status === "DELIVERED" && (
                          <button
                            onClick={() => {
                              setSelectedOrderForRefund(order)
                              setIsRefundModalOpen(true)
                            }}
                            className="mt-2 block w-full text-right text-[10px] text-red-500 hover:text-red-400 font-mono tracking-widest uppercase"
                          >
                            Request Refund
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-6 divide-y divide-white/10">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex gap-6 py-4 first:pt-0 last:pb-0 items-center">
                          <div className="h-24 w-20 bg-muted shrink-0 relative overflow-hidden border border-border">
                            <img
                              src={item.variant?.product?.images?.[0]?.url || "/placeholder.svg"}
                              alt="Item"
                              className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:opacity-100 transition-all"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-heading font-bold uppercase tracking-wider text-foreground mb-2">
                              {item.variant?.product?.name}
                            </p>
                            <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                              Spec: {item.variant?.size} | Units: {item.quantity}
                            </p>
                            {order.status === "DELIVERED" && (
                              <div className="flex gap-4 mt-3">
                                <button 
                                  onClick={() => {
                                    setSelectedProduct({ id: item.variant?.product?.id, name: item.variant?.product?.name })
                                    setIsReviewModalOpen(true)
                                  }}
                                  className="text-[9px] font-mono uppercase font-bold text-primary hover:text-primary/80 transition-colors tracking-widest"
                                >
                                  Write Review
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedProduct({ id: item.variant?.product?.id, name: item.variant?.product?.name })
                                    setIsGalleryModalOpen(true)
                                  }}
                                  className="text-[9px] font-mono uppercase font-bold text-emerald-500 hover:text-emerald-400 transition-colors tracking-widest"
                                >
                                  Upload to Gallery
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-mono text-muted-foreground">
                            {(item.price * item.quantity).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Address Book */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex justify-between items-end border-b border-racing-yellow/40 pb-4">
              <h3 className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-foreground">
                My Addresses
              </h3>
              <button
                onClick={() => {
                  setEditingAddress(null)
                  setIsAddAddressOpen(true)
                }}
                className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Target strokeWidth={1.5} className="w-3 h-3" /> Add Address
              </button>
            </div>

            <div className="space-y-4">
              {profile?.addresses?.length === 0 ? (
                <div className="py-8 text-center glass-dark border border-border">
                  <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                    No addresses saved
                  </p>
                </div>
              ) : (
                profile?.addresses?.map((addr: any) => (
                  <div key={addr.id} className="glass-dark border border-border p-6 relative group hover:border-racing-yellow/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-foreground">{addr.title}</span>
                      <div className="flex flex-col items-end gap-1">
                        {(addr.isDefaultShipping || addr.isDefaultBilling) && (
                          <span className="text-[8px] font-mono font-bold tracking-[0.2em] uppercase text-black bg-primary px-1.5 py-0.5">
                            Default Address
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-mono text-muted-foreground leading-relaxed space-y-1 uppercase">
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p>{addr.country}</p>
                      <p className="pt-2 text-[10px] tracking-wider text-muted-foreground">{addr.phone}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex justify-between transition-opacity">
                      <div className="flex gap-4">
                        <button 
                          onClick={() => {
                            setEditingAddress(addr)
                            setIsAddAddressOpen(true)
                          }}
                          className="text-[9px] font-mono uppercase text-muted-foreground hover:text-foreground transition-colors tracking-widest"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-[9px] font-mono uppercase text-red-500 hover:text-red-400 transition-colors tracking-widest"
                        >
                          Delete
                        </button>
                      </div>
                      {(!addr.isDefaultShipping || !addr.isDefaultBilling) && (
                        <button 
                          onClick={() => handleSetDefaultAddress(addr.id, true, true)}
                          className="text-[9px] font-mono uppercase text-primary hover:text-primary/80 transition-colors tracking-widest"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      <AddressModal 
        isOpen={isAddAddressOpen}
        onClose={() => setIsAddAddressOpen(false)}
        onSuccess={() => {
          loadDashboardData()
          router.refresh()
        }}
        editingAddress={editingAddress}
        isFirstAddress={profile?.addresses?.length === 0}
      />

      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        onSuccess={() => {
          loadDashboardData()
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
