"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Star, RefreshCw, ChevronRight, Home, ShoppingCart, Trash2 } from "lucide-react"

export default function CustomerWishlistPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [wishlist, setWishlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      // Fetch user's profile which contains the wishlist relation
      const res = await fetch("/api/customer/profile")
      if (res.ok) {
        const data = await res.json()
        // Simulated wishlist items for display (or query if seeded)
        setWishlist(data.wishlist?.items || [])
      } else {
        toast.error("Failed to load customer profile logs")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/customer/wishlist")
    } else if (status === "authenticated") {
      fetchWishlist()
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <div className="flex-grow flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            <span className="text-sm font-bold text-muted/50">Loading wishlist...</span>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between text-foreground font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          <a href="/customer" className="hover:text-primary transition flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Dashboard</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/70">My Wishlist</span>
        </div>

        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight leading-snug">My Wishlist</h2>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">Stars catalog items and save them for later checkouts.</p>
          </div>
          <Star className="w-8 h-8 text-primary animate-pulse" />
        </div>

        {wishlist.length === 0 ? (
          <Card className="border border-dashed border-border/40 p-12 text-center rounded-none">
            <CardContent className="pt-6">
              <Star className="h-14 w-14 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-bold text-foreground">Wishlist is currently empty</p>
              <p className="text-xs text-muted-foreground pt-1 mb-6">Discover premium styles and star them in our storefront catalogs.</p>
              <a href="/products" className="inline-flex h-11 items-center justify-center px-6 rounded-none bg-primary hover:bg-primary/95 text-white text-xs font-bold transition">
                Browse Products
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <Card key={item.id} className="border border-muted/10 rounded-none shadow-sm bg-card overflow-hidden transition hover:border-border/40 flex flex-col justify-between">
                <div className="relative aspect-square w-full bg-muted/10 border-b border-muted/10 overflow-hidden flex items-center justify-center">
                  {item.product?.images?.[0]?.url ? (
                    <img src={item.product.images[0].url} alt="" className="object-cover h-full w-full" />
                  ) : (
                    <Star className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-foreground line-clamp-1 leading-snug">{item.product?.name || "Premium Item"}</h3>
                    <p className="text-xs font-extrabold text-foreground mt-1">Rs. {item.product?.price || "999.00"}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => router.push(`/products/${item.product?.slug}`)}
                      className="flex-grow h-9 rounded-none bg-primary text-white text-[10px] font-bold"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 mr-1" /> View Product
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
