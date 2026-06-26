"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
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
      <div className="min-h-screen bg-carbon-dark flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-racing-yellow font-mono animate-pulse">
            Loading Wishlist...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-carbon-dark flex flex-col font-sans text-white">
      <Header />

      <main className="flex-1 container mx-auto px-6 md:px-12 py-24 md:py-32 relative z-10">
        
        <div className="mb-8">
          <Link href="/customer" className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-white/50 hover:text-racing-yellow transition-colors mb-6">
            <ArrowLeft className="w-3 h-3" /> Base Coordinates
          </Link>
          <h1 className="font-heading text-4xl md:text-5xl font-black text-white leading-none uppercase drop-shadow-[0_0_10px_rgba(255, 204, 0,0.3)]">
            Wishlist & Alerts
          </h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="py-24 text-center glass-dark border border-white/10">
            <p className="font-heading text-2xl font-black text-gray-500 mb-4 uppercase">Wishlist is empty</p>
            <Link href="/products" className="text-[11px] font-mono tracking-[0.2em] uppercase text-racing-yellow border-b border-racing-yellow pb-1 inline-flex items-center gap-2 group hover:text-neon-yellow transition-colors">
              Explore Showroom
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => {
              const product = item.product
              const inStock = product.variants?.some((v: any) => v.inventory?.quantity > 0)
              
              return (
                <div key={item.id} className="glass-dark border border-white/10 group hover:border-racing-yellow/50 transition-colors relative flex flex-col">
                  <Link href={`/products/${product.slug}`} className="block h-48 bg-smoke-dark relative overflow-hidden border-b border-white/10">
                    <img
                      src={product.images?.[0]?.url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:opacity-100 transition-all"
                    />
                    {!inStock && (
                      <div className="absolute top-2 right-2 bg-red-500/80 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1">
                        Out of Stock
                      </div>
                    )}
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-heading font-black uppercase tracking-wider text-white mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm font-mono text-gray-400 mb-4">
                        Rs. {Number(product.price).toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-3 mt-4">
                      {inStock ? (
                        <Button 
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-racing-yellow text-carbon-dark hover:bg-neon-yellow rounded-none text-xs font-bold uppercase tracking-widest"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleToggleAlert(product.id, item.notifyOnRestock)}
                          variant="outline"
                          className={`w-full rounded-none border-white/20 text-xs font-bold uppercase tracking-widest ${item.notifyOnRestock ? "bg-white/10 text-white" : "hover:bg-white/5 text-gray-400"}`}
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
      <Footer />
    </div>
  )
}
