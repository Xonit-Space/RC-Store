"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { addCustomerAddress } from "@/actions/auth"
import { Plus, X, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useLoading } from "@/components/providers/loading-provider"
import { useCustomer } from "@/components/providers/customer-provider"
import { AddressSchema } from "@/validators/auth"

export default function CustomerDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { withLoading } = useLoading()
  const { profile } = useCustomer()

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false)
  const [addrTitle, setAddrTitle] = useState("Home")
  const [line1, setLine1] = useState("")
  const [line2, setLine2] = useState("")
  const [city, setCity] = useState("")
  const [addrState, setAddrState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("US")
  const [phone, setPhone] = useState("")
  const [addressLoading, setAddressLoading] = useState(false)

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const ordRes = await fetch("/api/customer/orders")
      if (ordRes.ok) {
        const json = await ordRes.json()
        setOrders(json.data || (Array.isArray(json) ? json : []))
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
      router.push("/login?callbackUrl=/customer")
    } else if (status === "authenticated") {
      loadDashboardData()
    }
  }, [status])

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddressLoading(true)

    const payload = {
      title: addrTitle,
      line1, line2: line2 || undefined,
      city, state: addrState, postalCode, country, phone,
      isDefaultShipping: profile?.addresses?.length === 0,
      isDefaultBilling: profile?.addresses?.length === 0,
    }

    const validation = AddressSchema.safeParse(payload)
    if (!validation.success) {
      toast.error(validation.error.errors.map(err => err.message).join(", "))
      setAddressLoading(false)
      return
    }

    try {
      const response = await addCustomerAddress(session?.user?.id || "", payload)
      if (response.success) {
        toast.success("Address added")
        setIsAddAddressOpen(false)
        setLine1(""); setLine2(""); setCity(""); setAddrState(""); setPostalCode(""); setPhone("")
        await loadDashboardData()
      } else {
        toast.error(response.error || "Failed to add address")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setAddressLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground animate-pulse">
            Loading Account
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 md:px-12 py-24 md:py-32">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/40 pb-12 mb-16 gap-8">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Private Account
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-light text-foreground leading-none">
              Welcome, {profile?.name || "Client"}
            </h1>
            <p className="text-sm text-muted-foreground mt-4">{profile?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-1"
          >
            Sign Out
          </button>
        </div>

        {/* Members Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="p-8 border border-border/40 bg-muted/20">
            <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground mb-6">Purchase History</p>
            <p className="font-serif text-3xl font-light text-foreground">{orders.length}</p>
            <p className="text-[11px] tracking-wider uppercase text-muted-foreground mt-1">Orders</p>
          </div>
          <div className="p-8 border border-border/40 bg-muted/20">
            <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground mb-6">Loyalty Status</p>
            <p className="font-serif text-3xl font-light text-foreground">{profile?.loyaltyPoint?.pointsBalance || 0}</p>
            <p className="text-[11px] tracking-wider uppercase text-muted-foreground mt-1">Points</p>
          </div>
          <div className="p-8 border border-border/40 bg-muted/20">
            <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground mb-6">Store Credit</p>
            <p className="font-serif text-3xl font-light text-foreground">Rs. {profile?.storeCredits?.[0]?.balance || 0}</p>
            <p className="text-[11px] tracking-wider uppercase text-muted-foreground mt-1">Available</p>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Order History */}
          <div className="lg:col-span-8 space-y-8">
            <h3 className="text-[11px] tracking-[0.2em] uppercase text-foreground border-b border-border/40 pb-4">
              Recent Orders
            </h3>

            {orders.length === 0 ? (
              <div className="py-16 text-center border border-border/40">
                <p className="font-serif text-2xl font-light text-foreground mb-4">No purchases yet</p>
                <a href="/products" className="text-[11px] tracking-[0.2em] uppercase text-accent border-b border-accent pb-1 inline-flex items-center gap-2 group">
                  Explore Collection
                  <ArrowRight strokeWidth={1} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border border-border/40 bg-background group hover:border-accent transition-colors">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-border/40 bg-muted/30">
                      <div>
                        <p className="text-[11px] tracking-widest uppercase text-foreground mb-1">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                          2026-05-27
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block mb-1 text-[9px] tracking-[0.25em] uppercase text-accent border border-accent/30 px-2 py-0.5">
                          {order.status}
                        </span>
                        <p className="text-sm text-foreground">
                          Rs. {order.total.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-6 divide-y divide-border/40">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex gap-6 py-4 first:pt-0 last:pb-0 items-center">
                          <div className="h-24 w-20 bg-muted shrink-0 relative overflow-hidden">
                            <img
                              src={item.variant?.product?.images?.[0]?.url || "/placeholder.svg"}
                              alt="Item"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-light text-foreground mb-2">
                              {item.variant?.product?.name}
                            </p>
                            <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
                              Size: {item.variant?.size} | Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm text-foreground">
                            Rs. {(item.price * item.quantity).toLocaleString()}
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
            <div className="flex justify-between items-end border-b border-border/40 pb-4">
              <h3 className="text-[11px] tracking-[0.2em] uppercase text-foreground">
                Address Book
              </h3>
              <button
                onClick={() => setIsAddAddressOpen(true)}
                className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Plus strokeWidth={1} className="w-3 h-3" /> Add New
              </button>
            </div>

            <div className="space-y-4">
              {profile?.addresses?.length === 0 ? (
                <div className="py-8 text-center border border-border/40">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
                    No saved addresses
                  </p>
                </div>
              ) : (
                profile?.addresses?.map((addr: any) => (
                  <div key={addr.id} className="border border-border/40 p-6 bg-muted/20 relative group hover:border-accent transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[11px] tracking-widest uppercase text-foreground">{addr.title}</span>
                      {(addr.isDefaultShipping || addr.isDefaultBilling) && (
                        <span className="text-[8px] tracking-[0.2em] uppercase text-accent border border-accent/20 px-1.5 py-0.5">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p>{addr.country}</p>
                      <p className="pt-2 text-[10px] tracking-wider">{addr.phone}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      {/* ── REGISTER ADDRESS MODAL ── */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border/40 p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-serif text-2xl font-light text-foreground">Add Address</h3>
              <button
                onClick={() => setIsAddAddressOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X strokeWidth={1} className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground block">Label</label>
                  <input
                    value={addrTitle}
                    onChange={(e) => setAddrTitle(e.target.value)}
                    placeholder="Home, Work"
                    required
                    className="w-full bg-transparent border-b border-border/60 pb-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground block">Phone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1..."
                    required
                    className="w-full bg-transparent border-b border-border/60 pb-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground block">Street Address</label>
                <input
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="Address Line 1"
                  required
                  className="w-full bg-transparent border-b border-border/60 pb-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground block">Apt / Suite</label>
                <input
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-transparent border-b border-border/60 pb-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground block">City</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-border/60 pb-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground block">State</label>
                  <input
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-border/60 pb-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground block">Postal Code</label>
                  <input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-border/60 pb-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground block">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-transparent border-b border-border/60 pb-2 text-[11px] tracking-wider text-foreground focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="LK">Sri Lanka</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={addressLoading}
                className="w-full py-4 mt-4 bg-foreground text-[10px] tracking-[0.25em] uppercase text-background hover:bg-charcoal transition-colors duration-300 disabled:opacity-50"
              >
                {addressLoading ? "Saving..." : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
