"use client"

export const dynamic = "force-dynamic"

import { useCartStore } from "@/store/cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Truck, Info, Ticket } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useLoading } from "@/components/providers/loading-provider"
import { useEffect, useState } from "react"

export default function CartPage() {
  const { data: session } = useSession()
  const cartStore = useCartStore()
  const { withLoading } = useLoading()
  
  // Local state to track hydration completion to prevent SSR mismatches
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    cartStore.initializeGuestSession()
    // Trigger Zustand persistence rehydration
    useCartStore.persist.rehydrate()
    setIsHydrated(true)
  }, [])

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    try {
      await withLoading(cartStore.updateQuantity(itemId, newQty, session?.user?.id))
    } catch (error: any) {
      toast.error(error.message || "Failed to update item quantity")
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      await withLoading(cartStore.removeItem(itemId, session?.user?.id))
      toast.success("Item removed from your shopping bag")
    } catch (error) {
      toast.error("Failed to remove item")
    }
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between animate-pulse">
                <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Info className="h-10 w-10 text-muted-foreground/30 animate-spin" />
        </div>
              </div>
    )
  }

  const items = cartStore.items
  const subtotal = cartStore.getSubtotal()
  const tax = subtotal * 0.08
  const shipping = subtotal > 150 ? 0 : subtotal > 0 ? 15 : 0
  const grandTotal = subtotal + tax + shipping

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      
      <main className="flex-grow container mx-auto px-4 md:px-12 max-w-6xl pt-32 pb-24">
        <h1 className="text-2xl font-extrabold text-foreground mb-6 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" /> Your Shopping Bag
        </h1>

        {items.length === 0 ? (
          <Card className="border border-dashed border-border/40 p-12 text-center max-w-xl mx-auto  mt-6">
            <CardContent className="space-y-4 pt-6">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30" />
              <h3 className="font-extrabold text-lg text-foreground">Your bag is currently empty</h3>
              <p className="text-xs text-muted-foreground font-semibold">
                Looks like you haven&apos;t added any premium designer items to your checkout cart yet.
              </p>
              <Link href="/products" className="inline-block">
                <Button className="bg-gradient-to-r from-foreground to-foreground hover:from-foreground hover:to-foreground font-bold  active:scale-95 transition">
                  Browse Catalog
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ── LEFT: CART ITEMS LIST ── */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 bg-background border border-border/40   hover: transition items-center"
                >
                  {/* Photo thumbnail */}
                  <div className="h-24 w-24 shrink-0 bg-background border border-muted/10  overflow-hidden">
                    <img
                      src={item.product.imageUrl || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Garment details */}
                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                    <h3 className="font-bold text-foreground text-sm truncate">
                      {item.product.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start text-[10px] font-bold text-muted/50">
                      {item.product.size && (
                        <Badge variant="outline" className="text-[9px] py-0 px-2 uppercase">
                          Size: {item.product.size}
                        </Badge>
                      )}
                      {item.product.color && (
                        <Badge variant="outline" className="text-[9px] py-0 px-2 uppercase flex items-center gap-1">
                          <span className="h-2.5 w-2.5 rounded-full border shadow-inner shrink-0" style={{ backgroundColor: item.product.color }} />
                          Color
                        </Badge>
                      )}
                      {item.addonId && (
                        <Badge variant="outline" className="text-[9px] py-0 px-2 uppercase text-terracotta border-terracotta/30 bg-terracotta/5">
                          Addon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-extrabold text-foreground">
                      Rs. {item.product.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity adjustment meters */}
                  <div className="flex items-center gap-2 shrink-0 border border-border/40/60 p-1.5 bg-background ">
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                      className="h-7 w-7  hover:bg-border/40 text-foreground font-extrabold flex items-center justify-center active:scale-95 transition"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-extrabold text-foreground w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                      className="h-7 w-7 bg-foreground hover:bg-foreground text-foreground  font-extrabold flex items-center justify-center active:scale-95 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Remove action */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="h-9 w-9  border border-red-100 text-yellow-500 hover:bg-red-50 flex items-center justify-center shrink-0 transition"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* ── RIGHT: SUMMARY ORDER LEDGER ── */}
            <div className="lg:col-span-4 bg-background border border-border/40 p-5   h-fit space-y-5">
              <h3 className="font-extrabold text-foreground text-sm pb-3 border-b uppercase tracking-wide">
                Order Summary
              </h3>

              <div className="space-y-3.5 pt-1 text-xs font-semibold text-muted/50">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-bold text-foreground">Rs. {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax (8%)</span>
                  <span className="font-bold text-foreground">Rs. {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Truck className="h-4 w-4 text-muted-foreground" /> Ground Shipping
                  </span>
                  <span className="font-bold text-foreground">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-extrabold">FREE</span>
                    ) : (
                      `Rs. ${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {subtotal < 150 && (
                  <div className="p-3 bg-foreground border border-foreground text-foreground text-[10px] font-bold  flex items-center gap-1.5">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>Spend Rs. {(150 - subtotal).toFixed(2)} more to unlock FREE SHIPPING!</span>
                  </div>
                )}
              </div>

              <div className="my-4 border-t border-dashed" />

              <div className="flex justify-between font-extrabold text-foreground text-base pt-1">
                <span>Total Amount Due</span>
                <span className="text-foreground">Rs. {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Promo input field */}
              <div className="flex gap-2">
                <Input placeholder="PROMO CODE" className="h-9 text-xs  bg-background" />
                <Button variant="outline" size="sm" className="h-9  font-bold">
                  Apply
                </Button>
              </div>

              {/* Checkout CTA */}
              <Link href="/checkout" className="block pt-2">
                <Button className="w-full h-11 bg-gradient-to-r from-foreground to-foreground hover:from-foreground hover:to-foreground font-bold   active:scale-95 transition">
                  PROCEED TO SECURE CHECKOUT <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

          </div>
        )}
      </main>

          </div>
  )
}
