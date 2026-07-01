"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useCartStore } from "@/store/cart"
import { processStripeCheckout, checkCoupon } from "@/actions/order"
import { getAvailableShippingOptions } from "@/actions/shipping"
import { getTaxRateByRegionCode } from "@/actions/tax"
import { getStoreSettings } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, ShieldCheck, Mail, User, Phone, MapPin, AlertCircle, RefreshCw, Truck } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AddressSchema } from "@/validators/auth"
import { useLoading } from "@/components/providers/loading-provider"
import { CheckoutStepper } from "@/components/cart/checkout-stepper"
import { usePrice } from "@/hooks/use-price"

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const cartStore = useCartStore()
  const { withLoading } = useLoading()
  const { formatPrice } = usePrice()

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
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [taxRate, setTaxRate] = useState(0.08)
  
  // Shipping & Settings State
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedShippingRuleId, setSelectedShippingRuleId] = useState<string | null>(null)
  const [storeSettings, setStoreSettings] = useState<any>(null)
  
  const [addInsurance, setAddInsurance] = useState(false)
  const [safeDrop, setSafeDrop] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  
  const loadAddresses = async () => {
    if (status !== "authenticated") return
    try {
      const res = await fetch("/api/customer/addresses")
      const json = await res.json()
      if (json.success && json.data.length > 0) {
        setAddresses(json.data)
        const defaultAddr = json.data.find((a: any) => a.isDefaultShipping) || json.data[0]
        selectAddress(defaultAddr)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const selectAddress = (addr: any) => {
    setSelectedAddressId(addr.id)
    setTitle(addr.title)
    setLine1(addr.line1)
    setLine2(addr.line2 || "")
    setCity(addr.city)
    setState(addr.state)
    setPostalCode(addr.postalCode)
    setCountry(addr.country)
    setPhone(addr.phone)
  }

  useEffect(() => {
    if (status === "authenticated") {
      loadAddresses()
    }
  }, [status])

  useEffect(() => {
    cartStore.initializeGuestSession()
    useCartStore.persist.rehydrate()
    setIsHydrated(true)

    // Load store settings (Insurance & Safe drop)
    getStoreSettings().then(res => {
      if (res.success) setStoreSettings(res.data)
    })
  }, [])

  useEffect(() => {
    getTaxRateByRegionCode(country).then(rate => setTaxRate(rate))
  }, [country])

  useEffect(() => {
    if (isHydrated) {
      getAvailableShippingOptions(cartStore.getSubtotal()).then(options => {
        setShippingOptions(options)
        if (options.length > 0 && !selectedShippingRuleId) {
          setSelectedShippingRuleId(options[0].id)
        }
      })
    }
  }, [cartStore.getSubtotal(), isHydrated])

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }
    const subtotal = cartStore.getSubtotal();
    const result = await checkCoupon(couponCode, subtotal);
    if (result.success && result.data) {
      setCouponDiscount(result.data.discount);
      toast.success(`Coupon applied! -${formatPrice(result.data.discount)}`);
    } else {
      setCouponDiscount(0);
      toast.error(result.error || "Invalid coupon");
    }
  };

  const selectedShippingOption = shippingOptions.find(o => o.id === selectedShippingRuleId)
  const shippingCost = selectedShippingOption ? Number(selectedShippingOption.shippingCost) : 15
  const insuranceCost = (addInsurance && storeSettings) ? Number(storeSettings.shippingInsuranceCost) : 0

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

    const payload = { title, line1, line2: line2 || undefined, city, state, postalCode, country, phone }
    const validation = AddressSchema.safeParse(payload)

    if (!validation.success) {
      const errorMsg = validation.error.errors.map((err) => err.message).join(", ")
      setError(errorMsg)
      toast.error("Please correct address validation errors")
      setCheckoutLoading(false)
      return
    }

    if (!selectedShippingRuleId) {
      setError("Please select a shipping method")
      setCheckoutLoading(false)
      return
    }

    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
      // Note: In a real app we'd pass selectedShippingRuleId, insurance, etc to processStripeCheckout
      // Since we just need to charge the grand total, we'll sum shipping and insurance and pass it as total shipping.
      
      const response = await processStripeCheckout(
        session.user.id,
        session.user.email || "",
        `${baseUrl}/customer`, 
        `${baseUrl}/checkout`, 
        couponCode || undefined, 
        shippingCost + insuranceCost 
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
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            <span className="text-sm font-bold text-foreground">Checking auth session...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
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
      </div>
    )
  }

  const items = cartStore.items
  const subtotal = cartStore.getSubtotal()
  const taxableAmount = Math.max(0, subtotal - couponDiscount)
  const tax = taxableAmount * taxRate
  const grandTotal = taxableAmount + tax + shippingCost + insuranceCost

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      
      <main className="flex-1 container mx-auto px-4 md:px-12 max-w-6xl pt-32 pb-24">
        <CheckoutStepper currentStep={2} />
        
        <h1 className="text-2xl font-extrabold text-foreground mb-6 flex items-center gap-2 mt-12">
          <ShieldCheck className="h-6 w-6 text-emerald-600" /> Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── LEFT: SHIPPING DETAILS FORM ── */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="bg-background border border-border/40">
              <CardContent className="p-6">
                <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <h3 className="font-extrabold text-foreground text-sm pb-3 border-b uppercase tracking-wide">
                    Shipping Destination Address
                  </h3>

                  {addresses.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <p className="text-xs font-bold text-foreground">Select a Saved Address</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {addresses.map(addr => (
                          <div 
                            key={addr.id}
                            onClick={() => selectAddress(addr)}
                            className={`p-3 border cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/50'}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-foreground">{addr.title}</span>
                              {(addr.isDefaultShipping || addr.isDefaultBilling) && (
                                <span className="text-[8px] font-mono font-bold tracking-[0.2em] uppercase text-black bg-primary px-1.5 py-0.5">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground leading-relaxed uppercase">
                              <p>{addr.line1}</p>
                              <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                            </div>
                          </div>
                        ))}
                        <div 
                          onClick={() => {
                            setSelectedAddressId(null)
                            setTitle("New Address")
                            setLine1("")
                            setLine2("")
                            setCity("")
                            setState("")
                            setPostalCode("")
                            setPhone("")
                          }}
                          className={`p-3 border cursor-pointer transition-colors flex items-center justify-center min-h-[80px] ${selectedAddressId === null ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/50'}`}
                        >
                          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-foreground">+ Add New Address</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold  animate-in slide-in-from-top-1">
                      <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground block">Address Label</label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Home, Office, Penthouse"
                        required
                        className="h-10 text-xs bg-background "
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground block">Phone Number</label>
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
                    <label className="text-xs font-bold text-foreground block">Street Address Line 1</label>
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
                    <label className="text-xs font-bold text-foreground block">Apartment, Suite, Unit (Optional)</label>
                    <Input
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      placeholder="Apt 24B"
                      className="h-10 text-xs bg-background "
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-foreground block">City</label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New York"
                        required
                        className="h-10 text-xs bg-background "
                      />
                    </div>

                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-foreground block">State</label>
                      <Input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="NY"
                        required
                        className="h-10 text-xs bg-background "
                      />
                    </div>

                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-foreground block">Postal Code</label>
                      <Input
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="10013"
                        required
                        className="h-10 text-xs bg-background "
                      />
                    </div>

                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-foreground block">Country</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full h-10 border border-border/40 bg-background text-xs font-semibold px-2.5 outline-none dark:text-white text-black"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="LK">Sri Lanka</option>
                      </select>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-background border border-border/40">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-extrabold text-foreground text-sm pb-3 border-b uppercase tracking-wide">
                  Delivery Options
                </h3>
                
                {shippingOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Calculating shipping rates...</p>
                ) : (
                  <div className="space-y-3">
                    {shippingOptions.map(option => (
                      <div 
                        key={option.id}
                        onClick={() => setSelectedShippingRuleId(option.id)}
                        className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${selectedShippingRuleId === option.id ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/50'}`}
                      >
                        <div className="flex items-center gap-4">
                          {option.logoUrl ? (
                            <img src={option.logoUrl} alt={option.courierName || 'Courier'} className="w-10 h-10 object-contain bg-white rounded-md p-1 border border-border/20" />
                          ) : (
                            <div className="w-10 h-10 bg-muted/20 border border-border/40 flex items-center justify-center rounded-md">
                              <Truck className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-foreground">{option.name}</p>
                            {option.estimatedDaysMin && option.estimatedDaysMax && (
                              <p className="text-xs text-muted-foreground">
                                Arrives in {option.estimatedDaysMin} - {option.estimatedDaysMax} days
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold">{Number(option.shippingCost) === 0 ? "FREE" : formatPrice(Number(option.shippingCost))}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedShippingRuleId === option.id ? 'border-primary' : 'border-muted-foreground/30'}`}>
                            {selectedShippingRuleId === option.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {storeSettings && (
                  <div className="pt-4 border-t border-border/40 space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="insurance" 
                        checked={addInsurance}
                        onCheckedChange={(c) => setAddInsurance(c as boolean)}
                        className="mt-1"
                      />
                      <div>
                        <label htmlFor="insurance" className="font-bold text-sm text-foreground cursor-pointer">
                          Add delivery insurance for {formatPrice(Number(storeSettings.shippingInsuranceCost))}
                        </label>
                        <p className="text-xs text-muted-foreground">Protect your order against loss, theft, or damage in transit.</p>
                      </div>
                    </div>
                    
                    {storeSettings.enableSafeDrop && (
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          id="safedrop" 
                          checked={safeDrop}
                          onCheckedChange={(c) => setSafeDrop(c as boolean)}
                          className="mt-1"
                        />
                        <div>
                          <label htmlFor="safedrop" className="font-bold text-sm text-foreground cursor-pointer">
                            Safe drop
                          </label>
                          <p className="text-xs text-muted-foreground">Leave my delivery in a safe place if no one&apos;s home.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </CardContent>
            </Card>

          </div>
          
          {/* ── RIGHT: SUMMARY SIDEBAR ── */}
          <div className="lg:col-span-4 bg-background border border-border/40 p-5 h-fit space-y-4">
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
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 text-xs font-semibold text-foreground">
              <div className="flex justify-between">
                <span className="dark:text-white text-black">Subtotal</span>
                <span className="font-bold dark:text-white text-black">{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({couponCode})</span>
                  <span className="font-bold">-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="dark:text-white text-black">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                <span className="font-bold dark:text-white text-black">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="dark:text-white text-black">Shipping {selectedShippingOption && `(${selectedShippingOption.name})`}</span>
                <span className="font-bold dark:text-white text-black">{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
              </div>
              {addInsurance && (
                 <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
                  <span>Delivery Insurance</span>
                  <span className="font-bold">{formatPrice(insuranceCost)}</span>
                </div>
              )}
              <div className="my-3 border-t border-dashed" />
              <div className="flex justify-between font-extrabold dark:text-white text-black text-sm pt-1">
                <span>Order Total Due</span>
                <span className="dark:text-white text-black">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 space-y-2">
              <label className="text-xs font-bold text-foreground block">Discount / Promo Code</label>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER25"
                  className="h-9 text-xs bg-background uppercase placeholder:normal-case"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="h-9 text-xs font-bold"
                  onClick={handleApplyCoupon}
                >
                  Apply
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              form="checkout-form"
              disabled={checkoutLoading || items.length === 0}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-extrabold text-xs active:scale-95 transition mt-4"
            >
              {checkoutLoading ? "Preparing Secure Payment Gateway..." : "PROCEED TO PAYMENT"}
            </Button>
          </div>

        </div>
      </main>

    </div>
  )
}
