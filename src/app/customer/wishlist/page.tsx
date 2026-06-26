"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getUserWishlist, toggleWishlist, toggleRestockAlert } from "@/actions/wishlist"
import { Trash2, ShoppingCart, ArrowLeft, Bell, BellOff } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart"

export default function CustomerWishlistPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const cartStore = useCartStore()

  const [wishlist, setWishlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadWishlist = async () => {
    setLoading(true)
    const res = await getUserWishlist()
    if (res.success && res.data) {
      setWishlist(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/customer/wishlist")
    } else if (status === "authenticated") {
      loadWishlist()
    }
  }, [status])

  const handleRemove = async (productId: string) => {
    const res = await toggleWishlist(productId)
    if (res.success) {
      toast.success("Removed from wishlist")
      loadWishlist()
    } else {
      toast.error(res.error)
    }
  }

  const handleToggleAlert = async (productId: string, current: boolean) => {
    const res = await toggleRestockAlert(productId, !current)
    if (res.success) {
      toast.success(!current ? "Restock alert enabled" : "Restock alert disabled")
      loadWishlist()
    } else {
      toast.error(res.error)
    }
  }

  const handleAddToCart = (product: any) => {
    if (!product.variants || product.variants.length === 0) return
    const variant = product.variants[0]
    cartStore.addItem({
      variantId: variant.id,
      quantity: 1,
      product: {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        imageUrl: product.images?.[0]?.url || "/placeholder.svg",
        size: variant.size || "",
        color: variant.color || "",
      }
    }, session?.user?.id)
    toast.success("Added to cart")
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
                <div className="flex-1 flex items-center justify-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-mono animate-pulse">
            Loading Wishlist...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      
      <main className="flex-1 container mx-auto px-6 md:px-12 py-24 md:py-32 relative z-10">
        
        <div className="mb-8">
          <Link href="/customer" className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-white/50 hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-3 h-3" /> My Addresses
          </Link>
          <h1 className="font-heading text-4xl md:text-5xl font-black text-foreground leading-none uppercase drop-shadow-[0_0_10px_rgba(255, 204, 0,0.3)]">
            Wishlist & Alerts
          </h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="py-24 text-center glass-dark border border-border">
            <p className="font-heading text-2xl font-black text-muted-foreground mb-4 uppercase">Wishlist is empty</p>
            <Link href="/products" className="text-[11px] font-mono tracking-[0.2em] uppercase text-primary border-b border-primary pb-1 inline-flex items-center gap-2 group hover:text-primary/90 transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => {
              const product = item.product
              const inStock = product.variants?.some((v: any) => v.inventory?.quantity > 0)
              
              return (
                <div key={item.id} className="glass-dark border border-border group hover:border-racing-yellow/50 transition-colors relative flex flex-col">
                  <Link href={`/products/${product.slug}`} className="block h-48 bg-muted relative overflow-hidden border-b border-border">
                    <img
                      src={product.images?.[0]?.url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:opacity-100 transition-all"
                    />
                    {!inStock && (
                      <div className="absolute top-2 right-2 bg-red-500/80 text-foreground text-[8px] font-bold uppercase tracking-widest px-2 py-1">
                        Out of Stock
                      </div>
                    )}
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-heading font-black uppercase tracking-wider text-foreground mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm font-mono text-muted-foreground mb-4">
                        Rs. {Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="space-y-3 mt-4">
                      {inStock ? (
                        <Button 
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none text-xs font-bold uppercase tracking-widest"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleToggleAlert(product.id, item.notifyOnRestock)}
                          variant="outline"
                          className={`w-full rounded-none border-border text-xs font-bold uppercase tracking-widest ${item.notifyOnRestock ? "bg-muted text-foreground" : "hover:bg-white/5 text-muted-foreground"}`}
                        >
                          {item.notifyOnRestock ? (
                            <><BellOff className="w-4 h-4 mr-2" /> Cancel Alert</>
                          ) : (
                            <><Bell className="w-4 h-4 mr-2" /> Restock Alert</>
                          )}
                        </Button>
                      )}
                      
                      <Button 
                        onClick={() => handleRemove(product.id)}
                        variant="ghost"
                        className="w-full rounded-none text-red-500 hover:text-red-400 hover:bg-red-500/10 text-xs font-bold uppercase tracking-widest"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
          </div>
  )
}
