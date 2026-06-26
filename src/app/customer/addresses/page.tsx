"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MapPin, RefreshCw, ChevronRight, Home, Plus, Trash2, ShieldAlert } from "lucide-react"
import { addCustomerAddress } from "@/actions/auth"
import { AddressSchema } from "@/validators/auth"
import { useCustomer } from "@/components/providers/customer-provider"

export default function CustomerAddressesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { profile } = useCustomer()

  // Address form modal
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/customer/addresses")
    }
  }, [status])

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddressLoading(true)

    const payload = {
      title: addrTitle,
      line1,
      line2: line2 || undefined,
      city,
      state: addrState,
      postalCode,
      country,
      phone,
      isDefaultShipping: profile?.addresses?.length === 0,
      isDefaultBilling: profile?.addresses?.length === 0,
    }

    const validation = AddressSchema.safeParse(payload)
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((err) => err.message).join(", ")
      toast.error(errorMsg)
      setAddressLoading(false)
      return
    }

    try {
      const response = await addCustomerAddress(session?.user?.id || "", payload)
      if (response.success) {
        toast.success("Successfully added address record")
        setIsAddAddressOpen(false)
        setLine1("")
        setLine2("")
        setCity("")
        setAddrState("")
        setPostalCode("")
        setPhone("")
        router.refresh()
      } else {
        toast.error(response.error || "Failed to register address")
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setAddressLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
                <div className="flex-grow flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            <span className="text-sm font-bold text-muted/50">Loading addresses...</span>
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
          <span className="text-foreground/70">Address Book</span>
        </div>

        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight leading-snug">Address Book</h2>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">Manage your shipping and billing registries.</p>
          </div>
          <Button
            onClick={() => setIsAddAddressOpen(true)}
            className="h-11 px-5 rounded-none bg-primary hover:bg-primary/95 text-foreground text-xs font-bold transition active:scale-95 shadow-md shadow-primary/10"
          >
            <Plus className="h-4.5 w-4.5 mr-2" /> Add Address
          </Button>
        </div>

        {/* ── ADDRESS REGISTRY GRID ── */}
        {profile?.addresses?.length === 0 ? (
          <Card className="border border-dashed border-border/40 p-12 text-center rounded-none">
            <CardContent className="pt-6">
              <MapPin className="h-14 w-14 mx-auto text-muted-foreground/30 mb-3 animate-pulse" />
              <p className="text-sm font-bold text-foreground">No address records found</p>
              <p className="text-xs text-muted-foreground pt-1 mb-6">Create a default delivery address to enable Stripe checkouts.</p>
              <Button onClick={() => setIsAddAddressOpen(true)} className="h-11 px-6 rounded-none bg-primary">
                Add Delivery Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile?.addresses?.map((addr: any) => (
              <Card key={addr.id} className="border border-muted/10 rounded-none shadow-sm bg-card transition hover:border-border/40">
                <CardHeader className="bg-muted/5 border-b border-muted/10 p-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-extrabold text-foreground uppercase tracking-wide">
                      {addr.title}
                    </CardTitle>
                    <CardDescription className="text-[10px] text-muted-foreground font-bold mt-0.5">
                      {addr.isDefaultShipping ? "Default Shipping Address" : "Alternate Address"}
                    </CardDescription>
                  </div>
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="text-xs font-semibold text-foreground/70 space-y-1">
                    <p>{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p>{addr.country}</p>
                  </div>
                  <div className="pt-3 border-t border-muted/10 text-[10px] text-muted-foreground font-bold flex items-center">
                    Phone: {addr.phone}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── ADD ADDRESS MODAL OVERLAY ── */}
        {isAddAddressOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full rounded-none border border-muted/10 bg-card shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => setIsAddAddressOpen(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground/70 transition"
              >
                <RefreshCw className="h-5 w-5 rotate-45" />
              </button>

              <h3 className="text-lg font-bold text-foreground mb-1">Add Address Record</h3>
              <p className="text-xs text-muted-foreground mb-6 font-semibold">Please provide the complete shipping details below.</p>

              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted/50 uppercase tracking-wider block">Address Label</label>
                    <Input
                      type="text"
                      placeholder="Home, Office..."
                      value={addrTitle}
                      onChange={(e) => setAddrTitle(e.target.value)}
                      className="h-10 border-border/40 rounded-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted/50 uppercase tracking-wider block">Phone Contact</label>
                    <Input
                      type="text"
                      placeholder="0771234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 border-border/40 rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted/50 uppercase tracking-wider block">Street Address</label>
                  <Input
                    type="text"
                    placeholder="Line 1"
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    className="h-10 border-border/40 rounded-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Input
                    type="text"
                    placeholder="Line 2 (Optional)"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    className="h-10 border-border/40 rounded-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted/50 uppercase tracking-wider block">City</label>
                    <Input
                      type="text"
                      placeholder="Colombo"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-10 border-border/40 rounded-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted/50 uppercase tracking-wider block">State</label>
                    <Input
                      type="text"
                      placeholder="Western"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="h-10 border-border/40 rounded-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted/50 uppercase tracking-wider block">Postal Code</label>
                    <Input
                      type="text"
                      placeholder="00100"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="h-10 border-border/40 rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted/50 uppercase tracking-wider block">Country</label>
                  <Input
                    type="text"
                    placeholder="US, LK..."
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-10 border-border/40 rounded-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddAddressOpen(false)}
                    className="h-10 rounded-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addressLoading}
                    className="h-10 rounded-none bg-primary text-foreground"
                  >
                    {addressLoading ? "Saving..." : "Save Address"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

          </div>
  )
}
