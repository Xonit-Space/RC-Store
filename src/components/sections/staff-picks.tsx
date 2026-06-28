"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Star, ShoppingCart, Quote } from "lucide-react"
import { getStaffPicks } from "@/actions/landing-page"
import { CartIconButton } from "../product/cart-icon-button"

export function StaffPicks() {
  const [picks, setPicks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStaffPicks().then((data) => {
      setPicks(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <section className="bg-muted py-24 border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="h-[400px] w-full bg-background animate-pulse" />
        </div>
      </section>
    )
  }

  if (!picks || picks.length === 0) {
    return null // hide if no staff picks available
  }

  // Use the first pick for the hero layout (could be rotated later)
  const mainPick = picks[0]
  const product = mainPick.product
  const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1589793463357-550912af4a4c?q=80&w=600"
  const rating = product.reviews?.length ? (product.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / product.reviews.length).toFixed(1) : "0.0"
  const reviewsCount = product.reviews?.length || 0

  return (
    <section className="bg-muted py-24 border-t border-border">
      <div className="container mx-auto px-6 md:px-12">
        
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Expert Recommendations</p>
          </div>
          <h2 className="font-heading font-black text-4xl text-foreground uppercase tracking-wider mb-4">
            Staff Picks
          </h2>
          <p className="text-foreground/70 dark:text-muted-foreground max-w-xl text-sm">
            Hand-selected machines and gear driven by our track-tested mechanics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-background border border-border p-8 md:p-12 relative overflow-hidden items-center shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-racing-yellow/10 blur-[100px]" />
          
          {/* Staff Member Info */}
          <div className="flex flex-col justify-center relative z-10 lg:border-r border-border pb-8 lg:pb-0 lg:pr-12">
            <Quote className="w-12 h-12 text-border mb-6 rotate-180" />
            <p className="text-lg md:text-xl text-foreground font-serif italic leading-relaxed mb-8">
              &quot;{mainPick.quote}&quot;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
                <img src={mainPick.user.avatar || mainPick.user.image || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200"} alt={mainPick.user.name} className="w-full h-full object-cover grayscale" />
              </div>
              <div>
                <h4 className="font-heading font-black text-foreground uppercase tracking-widest text-lg">{mainPick.user.name}</h4>
                <p className="font-mono text-[10px] text-foreground/60 dark:text-primary uppercase tracking-widest">{mainPick.roleTitle}</p>
              </div>
            </div>
          </div>

          {/* Product Card */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 bg-white dark:bg-muted/30 p-6 rounded-lg border border-border shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="w-full sm:w-1/2 relative bg-background aspect-square p-4 flex items-center justify-center rounded-md">
              <img src={image} alt={product.name} className="w-full h-full object-contain" />
            </div>
            <div className="w-full sm:w-1/2 flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 fill-racing-yellow text-primary" />
                <span className="text-[10px] font-mono text-muted-foreground">{rating} ({reviewsCount})</span>
              </div>
              <h3 className="font-heading font-black text-xl text-foreground uppercase mb-2">{product.name}</h3>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
              <div className="text-2xl font-mono font-bold text-primary mb-6">{Number(product.price).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</div>
              <CartIconButton 
                product={product} 
                className="bg-muted hover:bg-racing-yellow text-foreground hover:text-carbon-dark border border-border hover:border-primary font-heading font-bold uppercase tracking-widest py-3 px-4 flex items-center justify-center gap-2 transition-colors text-sm w-fit"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </CartIconButton>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
