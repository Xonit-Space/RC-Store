import Link from "next/link"
import { Star, ShieldCheck, Zap, BatteryCharging, ShoppingCart } from "lucide-react"
import { CartIconButton } from "../product/cart-icon-button"
import { db } from "@/lib/db"

export async function FeaturedProductCard() {
  const product = await db.product.findFirst({
    where: { isFeatured: true, isActive: true },
    include: { images: true }
  })

  if (!product) return null

  const reviewStats = await db.review.aggregate({
    where: { productId: product.id },
    _avg: { rating: true },
    _count: { id: true }
  })

  const reviewCount = reviewStats._count.id
  const rating = reviewStats._avg.rating || 5
  
  const price = Number(product.price)
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null
  const imageUrl = product.images?.[0]?.url || "https://images.unsplash.com/photo-1588612143093-4e44208d1326?q=80&w=2070"
  
  // Format features based on actual product features or fallback
  const featureList = product.features.length >= 3 ? product.features.slice(0, 3) : [
    "High Performance",
    "Durable Build",
    "Ready to Run"
  ]

  // Feature icons mapping based on index
  const getFeatureIcon = (index: number) => {
    switch (index) {
      case 0: return <Zap className="w-5 h-5 text-primary" />
      case 1: return <ShieldCheck className="w-5 h-5 text-primary" />
      default: return <BatteryCharging className="w-5 h-5 text-primary" />
    }
  }

  return (
    <section className="bg-background py-24 relative overflow-hidden border-t border-border">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-racing-yellow/50 to-transparent" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="glass-dark border border-border p-8 md:p-12 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
          <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Image Side */}
            <div className="relative group">
              <div className="absolute inset-0 bg-racing-yellow/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full" />
              <img 
                src={imageUrl} 
                alt={product.name} 
                className="w-full h-auto object-cover relative z-10 scale-100 group-hover:scale-105 transition-transform duration-700 rounded-lg max-h-[500px]"
              />
              <div className="absolute top-4 left-4 z-20 bg-primary text-primary-foreground font-mono font-bold text-[10px] tracking-widest px-3 py-1 uppercase shadow-[0_0_10px_rgba(255, 204, 0,0.5)]">
                Featured Build
              </div>
            </div>

            {/* Content Side */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-4 h-4 ${star <= Math.round(rating) ? "fill-racing-yellow text-primary" : "text-muted-foreground"}`} />
                ))}
                <span className="text-xs font-mono text-foreground/60 dark:text-muted-foreground ml-2">({reviewCount} Reviews)</span>
              </div>
              
              <h2 className="font-heading font-black text-4xl md:text-5xl text-foreground uppercase tracking-tight mb-4">
                {product.name}
              </h2>
              
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-mono font-bold text-foreground">$ {price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                {originalPrice && (
                  <span className="text-sm font-mono text-foreground/50 dark:text-muted-foreground line-through">$ {originalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                )}
              </div>
              
              <p className="text-foreground/70 dark:text-muted-foreground mb-8 max-w-lg leading-relaxed line-clamp-3">
                {product.description || "Experience top-tier performance and durability with our latest featured RC build. Perfect for enthusiasts and beginners alike."}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {featureList.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {getFeatureIcon(idx)}
                    <span className="text-xs font-mono text-muted-foreground uppercase">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 relative z-20">
                <CartIconButton product={product} className="flex-1 bg-primary text-primary-foreground font-heading font-black uppercase tracking-widest py-4 px-6 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(255, 204, 0,0.3)] hover:shadow-[0_0_25px_rgba(255, 204, 0,0.6)]">
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </CartIconButton>
                <Link href={`/products/${product.slug}`} className="flex-1 border border-border text-foreground font-heading font-bold uppercase tracking-widest py-4 px-6 flex items-center justify-center hover:bg-white/5 hover:border-racing-yellow/50 transition-colors">
                  View Specs
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
