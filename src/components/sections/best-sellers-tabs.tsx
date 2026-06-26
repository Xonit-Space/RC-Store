"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Star, Heart, Repeat } from "lucide-react"
import { getBestSellers } from "@/actions/landing-page"
import { CartIconButton } from "../product/cart-icon-button"

export function BestSellersTabs() {
  const [productsData, setProductsData] = useState<Record<string, any[]>>({
    "Off-Road": [],
    "Crawlers": [],
    "On-Road": []
  })
  const [activeTab, setActiveTab] = useState<string>("Off-Road")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBestSellers().then((data) => {
      setProductsData(data)
      setLoading(false)
    })
  }, [])

  return (
    <section className="bg-background py-24 border-t border-border">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Top Performers</p>
          </div>
          <h2 className="font-heading font-black text-4xl text-foreground uppercase tracking-wider text-center mb-10">
            Best Sellers
          </h2>
          
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {Object.keys(productsData).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 font-mono font-bold text-xs tracking-widest uppercase transition-all border ${
                  activeTab === tab 
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(255, 204, 0,0.4)]" 
                  : "bg-transparent text-muted-foreground border-border hover:border-racing-yellow/50 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[400px] bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500" key={activeTab}>
            {productsData[activeTab]?.map((product) => {
              const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1594819047050-99defca82545?q=80&w=600"
              const rating = product.reviews?.length ? (product.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / product.reviews.length).toFixed(1) : "0.0"
              const reviewsCount = product.reviews?.length || 0

              return (
                <div key={product.id} className="relative bg-muted border border-border hover:border-racing-yellow/30 group flex flex-col">
                  <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`} />
                  
                  {/* Image Box */}
                  <div className="relative aspect-square overflow-hidden bg-background/50 p-4">
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="relative z-20 w-8 h-8 bg-carbon-dark/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="relative z-20 w-8 h-8 bg-carbon-dark/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-colors">
                        <Repeat className="w-4 h-4" />
                      </button>
                    </div>
                    <img 
                      src={image} 
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-110 transition-all duration-500"
                    />
                  </div>

                  {/* Content Box */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-racing-yellow text-primary" />
                      <span className="text-[10px] font-mono text-muted-foreground">{rating} ({reviewsCount})</span>
                    </div>
                    <Link href={`/products/${product.slug}`} className="relative z-20 font-heading font-bold text-lg text-foreground uppercase tracking-wide mb-4 hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </Link>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-mono font-bold text-lg text-foreground">${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <CartIconButton 
                        product={product} 
                        className="relative z-20 w-10 h-10 bg-muted/50 border border-border flex items-center justify-center text-foreground hover:bg-racing-yellow hover:text-carbon-dark hover:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link href="/products" className="border-b border-primary text-primary font-mono font-bold text-xs uppercase tracking-widest hover:text-white hover:border-white transition-colors pb-1">
            View All Best Sellers
          </Link>
        </div>
      </div>
    </section>
  )
}
