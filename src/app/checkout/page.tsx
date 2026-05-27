"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useCartStore } from "@/store/cart"
import { processStripeCheckout } from "@/actions/order"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, ShieldCheck, Mail, User, Phone, MapPin, AlertCircle, RefreshCw } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AddressSchema } from "@/validators/auth"
import { useLoading } from "@/components/providers/loading-provider"

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const cartStore = useCartStore()
  const { withLoading } = useLoading()

  // Hydration safeguard
  const [isHydrated, setIsHydrated] = useState(false)

  // Address Form state
  const [title, setTitle] = useState("Home")
  const [line1, setLine1] = useState("")
  const [line2, setLine2] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("US")
  const [phone, setPhone] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    cartStore.initializeGuestSession()
    useCartStore.persist.rehydrate()
    setIsHydrated(true)
  }, [])

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCheckoutLoading(true)

    if (!session || !session.user) {
      toast.error("Please sign in to place an order")
      router.push("/login?callbackUrl=/checkout")
      setCheckoutLoading(false)
      return
    }

    if (cartStore.items.length === 0) {
      setError("Your shopping bag is empty")
      setCheckoutLoading(false)
      return
    }

    // Enforce Zod Address validation client side
    const payload = { title, line1, line2: line2 || undefined, city, state, postalCode, country, phone }
    const validation = AddressSchema.safeParse(payload)

    if (!validation.success) {
      const errorMsg = validation.error.errors.map((err) => err.message).join(", ")
      setError(errorMsg)
      toast.error("Please correct address validation errors")
      setCheckoutLoading(false)
      return
    }

    try {
      // 1. Initialize Stripe Secure Session checkout action
      const response = await processStripeCheckout(
        session.user.id,
        session.user.email || "",
        "http://localhost:3000/customer", // Success URL redirects to orders tab
        "http://localhost:3000/checkout", // Cancel URL
        undefined, // Coupon code
        15 // Shipping cost snapshot
      )

      if (response.success && response.data?.checkoutUrl) {
        toast.success("Redirecting to Stripe secure checkout gateway...")
        router.push(response.data.checkoutUrl)
      } else {
        setError(response.error || "Failed to initialize payment gateway")
      }
    } catch (err: any) {
      setError("An unexpected system exception occurred. Try again.")
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (status === "loading" || !isHydrated) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            <span className="text-sm font-bold text-muted/50">Checking auth session...</span>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-12 max-w-md mx-auto text-center space-y-4">
          <ShieldCheck className="h-12 w-12 text-muted-foreground animate-pulse" />
          <h3 className="font-extrabold text-lg text-foreground">Secure Checkout Registry</h3>
          <p className="text-xs text-muted-foreground font-semibold">
            To safeguard order transactional integrity and loyalty point tracking, please sign in or register before checking out.
          </p>
          <Button onClick={() => router.push("/login?callbackUrl=/checkout")} className="w-full bg-foreground  font-bold">
            Sign In to Checkout
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  const items = cartStore.items
  const subtotal = cartStore.getSubtotal()
  const tax = subtotal * 0.08
  const shipping = 15
  const grandTotal = subtotal + tax + shipping

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header />

      <main className="flex-1 container mx-auto px-4 md:px-12 max-w-6xl pt-32 pb-24">
        <h1 className="text-2xl font-extrabold text-foreground mb-6 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-600" /> Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── LEFT: SHIPPING DETAILS FORM ── */}
          <div className="lg:col-span-8">
            <Card className="bg-background border border-border/40  ">
              <CardContent className="p-6">
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <h3 className="font-extrabold text-foreground text-sm pb-3 border-b uppercase tracking-wide">
                    Shipping Destination Address
                  </h3>

                  {error && (
                    <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold  animate-in slide-in-from-top-1">
                      <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted/50 block">Address Label</label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Home, Office, Penthouse"
                        required
                        className="h-10 text-xs bg-background "
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted/50 block">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 212 555 0198"
                          required
                          className="pl-8 h-10 text-xs bg-background "
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted/50 block">Street Address Line 1</label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                        placeholder="55 Mercer St"
                        required
                        className="pl-8 h-10 text-xs bg-background "
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted/50 block">Apartment, Suite, Unit (Optional)</label>
                    <Input
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      placeholder="Apt 24B"
                      className="h-10 text-xs bg-background "
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-muted/50 block">City</label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New York"
                        required
                        className="h-10 text-xs bg-background "
                      />
                    </div>

                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-muted/50 block">State</label>
                      <Input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="NY"
                        required
                        className="h-10 text-xs bg-background "
                      />
                    </div>

                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-muted/50 block">Postal Code</label>
                      <Input
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="10013"
                        required
                        className="h-10 text-xs bg-background "
                      />
                    </div>

                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-muted/50 block">Country</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full h-10 border border-border/40 bg-background text-xs font-semibold px-2.5  outline-none"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="LK">Sri Lanka</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={checkoutLoading || items.length === 0}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-extrabold text-xs   active:scale-95 transition mt-4"
                  >
                    {checkoutLoading ? "Preparing Secure Payment Gateway..." : "PROCEED TO PAYMENT (STRIPE GATEWAY)"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT: SUMMARY SIDEBAR ── */}
          <div className="lg:col-span-4 bg-background border border-border/40 p-5   h-fit space-y-4">
            <h3 className="font-extrabold text-foreground text-sm pb-3 border-b uppercase tracking-wide">
              Basket Overview
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3.5 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-3 border-b border-muted/5 items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground text-xs truncate">{item.product.name}</p>
                    <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                      QTY: {item.quantity} | Size: {item.product.size}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    Rs. {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 text-xs font-semibold text-muted/50">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">Rs. {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (8%)</span>
                <span className="font-bold text-foreground">Rs. {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Stripe Ground Shipping</span>
                <span className="font-bold text-foreground">Rs. {shipping.toFixed(2)}</span>
              </div>
              <div className="my-3 border-t border-dashed" />
              <div className="flex justify-between font-extrabold text-foreground text-sm pt-1">
                <span>Order Total Due</span>
                <span className="text-foreground">Rs. {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
