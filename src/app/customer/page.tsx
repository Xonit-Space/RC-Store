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
import { AddressSchema } from "@/validators/auth"

export default function CustomerDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { withLoading } = useLoading()
  const { profile } = useCustomer()

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false)
  const [addrTitle, setAddrTitle] = useState("Base Station")
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
        toast.success("Address Saved")
        setIsAddAddressOpen(false)
        setLine1(""); setLine2(""); setCity(""); setAddrState(""); setPostalCode(""); setPhone("")
        await loadDashboardData()
      } else {
        toast.error(response.error || "Error saving address")
      }
    } catch {
      toast.error("SYSTEM MALFUNCTION")
    } finally {
      setAddressLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-carbon-dark flex flex-col">
                <div className="flex-1 flex items-center justify-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-racing-yellow font-mono animate-pulse">
            Loading Dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-carbon-dark flex flex-col font-sans">
      
      <main className="flex-1 container mx-auto px-6 md:px-12 py-24 md:py-32 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-racing-yellow/40 pb-12 mb-16 gap-8">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-racing-yellow mb-4 font-mono font-bold flex items-center gap-2">
              <Zap className="w-3 h-3" /> My Profile
            </p>
            <h1 className="font-heading text-4xl md:text-6xl font-black text-white leading-none uppercase drop-shadow-[0_0_10px_rgba(255, 204, 0,0.3)]">
              Welcome, {profile?.name || "Pilot"}
            </h1>
            <p className="text-sm font-mono text-gray-400 mt-4 uppercase">ID: {profile?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[11px] font-mono tracking-[0.2em] uppercase text-gray-500 hover:text-racing-yellow transition-colors border-b border-transparent hover:border-racing-yellow pb-1"
          >
            Log Out
          </button>
        </div>

        {/* Members Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="p-8 glass-dark border border-racing-yellow/20 hover:border-racing-yellow/50 transition-colors group">
            <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-gray-500 mb-6 group-hover:text-racing-yellow transition-colors">Order History</p>
            <p className="font-heading text-4xl font-black text-white">{orders.length}</p>
            <p className="text-[11px] font-mono tracking-wider uppercase text-gray-500 mt-1">Total Orders</p>
          </div>
          <div className="p-8 glass-dark border border-racing-yellow/20 hover:border-racing-yellow/50 transition-colors group">
            <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-gray-500 mb-6 group-hover:text-racing-yellow transition-colors">Loyalty Points</p>
            <p className="font-heading text-4xl font-black text-white text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{profile?.loyaltyPoint?.pointsBalance || 0}</p>
            <p className="text-[11px] font-mono tracking-wider uppercase text-gray-500 mt-1">Points Balance</p>
          </div>
          <div className="p-8 glass-dark border border-racing-yellow/20 hover:border-racing-yellow/50 transition-colors group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-racing-yellow/10 rounded-full blur-xl group-hover:bg-racing-yellow/20 transition-colors" />
            <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-gray-500 mb-6 group-hover:text-racing-yellow transition-colors">Store Credit</p>
            <p className="font-heading text-4xl font-black text-white">Rs. {profile?.storeCredits?.[0]?.balance || 0}</p>
            <p className="text-[11px] font-mono tracking-wider uppercase text-gray-500 mt-1">Available Balance</p>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Order History */}
          <div className="lg:col-span-8 space-y-8">
            <h3 className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-white border-b border-racing-yellow/40 pb-4">
              Recent Orders
            </h3>

            {orders.length === 0 ? (
              <div className="py-16 text-center glass-dark border border-racing-yellow/20">
                <p className="font-heading text-2xl font-black text-white mb-4 uppercase text-gray-500">No orders found</p>
                <a href="/products" className="text-[11px] font-mono tracking-[0.2em] uppercase text-racing-yellow border-b border-racing-yellow pb-1 inline-flex items-center gap-2 group hover:text-neon-yellow transition-colors">
                  Continue Shopping
                  <ArrowRight strokeWidth={1.5} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="glass-dark border border-white/10 group hover:border-racing-yellow/50 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-racing-yellow/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                      <div>
                        <p className="text-[11px] font-mono font-bold tracking-widest uppercase text-white mb-1">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-[10px] font-mono text-gray-500 tracking-wider uppercase">
                          Order Date: 2026-05-27
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block mb-1 text-[9px] font-mono font-bold tracking-[0.25em] uppercase text-racing-yellow border border-racing-yellow/30 px-2 py-0.5 bg-racing-yellow/5">
                          {order.status}
                        </span>
                        <p className="text-sm font-heading font-black text-white tracking-widest">
                          Rs. {order.total.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-6 divide-y divide-white/10">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex gap-6 py-4 first:pt-0 last:pb-0 items-center">
                          <div className="h-24 w-20 bg-smoke-dark shrink-0 relative overflow-hidden border border-white/5">
                            <img
                              src={item.variant?.product?.images?.[0]?.url || "/placeholder.svg"}
                              alt="Item"
                              className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:opacity-100 transition-all"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-heading font-bold uppercase tracking-wider text-white mb-2">
                              {item.variant?.product?.name}
                            </p>
                            <p className="text-[10px] font-mono tracking-widest uppercase text-gray-400">
                              Spec: {item.variant?.size} | Units: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-mono text-gray-300">
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
            <div className="flex justify-between items-end border-b border-racing-yellow/40 pb-4">
              <h3 className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-white">
                My Addresses
              </h3>
              <button
                onClick={() => setIsAddAddressOpen(true)}
                className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-racing-yellow transition-colors flex items-center gap-1"
              >
                <Target strokeWidth={1.5} className="w-3 h-3" /> Add Address
              </button>
            </div>

            <div className="space-y-4">
              {profile?.addresses?.length === 0 ? (
                <div className="py-8 text-center glass-dark border border-white/10">
                  <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-gray-500">
                    No addresses saved
                  </p>
                </div>
              ) : (
                profile?.addresses?.map((addr: any) => (
                  <div key={addr.id} className="glass-dark border border-white/10 p-6 relative group hover:border-racing-yellow/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-white">{addr.title}</span>
                      {(addr.isDefaultShipping || addr.isDefaultBilling) && (
                        <span className="text-[8px] font-mono font-bold tracking-[0.2em] uppercase text-black bg-racing-yellow px-1.5 py-0.5">
                          Default Address
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-mono text-gray-400 leading-relaxed space-y-1 uppercase">
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p>{addr.country}</p>
                      <p className="pt-2 text-[10px] tracking-wider text-gray-500">{addr.phone}</p>
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
        <div className="fixed inset-0 bg-carbon-dark/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-dark border border-racing-yellow/50 p-8 w-full max-w-md shadow-[0_0_30px_rgba(255, 204, 0,0.15)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-racing-yellow to-transparent opacity-50" />
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-heading text-2xl font-black tracking-wider text-white uppercase">Add New Address</h3>
              <button
                onClick={() => setIsAddAddressOpen(false)}
                className="text-gray-500 hover:text-racing-yellow transition-colors"
              >
                <X strokeWidth={2} className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-gray-400 block">Address Title</label>
                  <input
                    value={addrTitle}
                    onChange={(e) => setAddrTitle(e.target.value)}
                    placeholder="HQ, Pit Stop"
                    required
                    className="w-full bg-smoke-dark border-b border-white/20 pb-2 pt-2 px-2 text-sm text-white focus:outline-none focus:border-racing-yellow transition-colors font-mono uppercase placeholder-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-gray-400 block">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1..."
                    required
                    className="w-full bg-smoke-dark border-b border-white/20 pb-2 pt-2 px-2 text-sm text-white focus:outline-none focus:border-racing-yellow transition-colors font-mono placeholder-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-gray-400 block">Address Line 1</label>
                <input
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="Address Line 1"
                  required
                  className="w-full bg-smoke-dark border-b border-white/20 pb-2 pt-2 px-2 text-sm text-white focus:outline-none focus:border-racing-yellow transition-colors font-mono placeholder-gray-600 uppercase"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-gray-400 block">Unit / Level</label>
                <input
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-smoke-dark border-b border-white/20 pb-2 pt-2 px-2 text-sm text-white focus:outline-none focus:border-racing-yellow transition-colors font-mono placeholder-gray-600 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-gray-400 block">City</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full bg-smoke-dark border-b border-white/20 pb-2 pt-2 px-2 text-sm text-white focus:outline-none focus:border-racing-yellow transition-colors font-mono uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-gray-400 block">Region</label>
                  <input
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    required
                    className="w-full bg-smoke-dark border-b border-white/20 pb-2 pt-2 px-2 text-sm text-white focus:outline-none focus:border-racing-yellow transition-colors font-mono uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-gray-400 block">Zip Code</label>
                  <input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="w-full bg-smoke-dark border-b border-white/20 pb-2 pt-2 px-2 text-sm text-white focus:outline-none focus:border-racing-yellow transition-colors font-mono uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-gray-400 block">Territory</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-smoke-dark border-b border-white/20 pb-2 pt-2 px-2 text-[11px] font-mono tracking-wider text-white focus:outline-none focus:border-racing-yellow transition-colors appearance-none cursor-pointer uppercase"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="LK">Sri Lanka</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="w-1/3 py-4 border border-white/20 text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressLoading}
                  className="w-2/3 py-4 bg-racing-yellow text-[10px] font-heading font-black tracking-[0.2em] uppercase text-white hover:bg-neon-yellow hover:shadow-[0_0_15px_rgba(255, 204, 0,0.5)] transition-all disabled:opacity-50"
                >
                  {addressLoading ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

          </div>
  )
}
