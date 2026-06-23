"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { getNewReleases } from "@/actions/landing-page"

export function NewReleases() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNewReleases().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <section className="bg-carbon-dark py-24 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-smoke-dark animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products.length) return null

  return (
    <section className="bg-carbon-dark py-24 border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neon-blue">Fresh Drops</p>
            </div>
            <h2 className="font-heading font-black text-4xl text-white uppercase tracking-wider">
              New Releases
            </h2>
          </div>
          <Link href="/collections/new-releases" className="border-b border-white/20 text-muted-foreground font-mono font-bold text-xs uppercase tracking-widest hover:text-white hover:border-white transition-colors pb-1 shrink-0">
            View All New Gear
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product, index) => {
            const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1594819047050-99defca82545?q=80&w=600"
            return (
              <div key={product.id} className="group bg-smoke-dark border border-white/5 flex flex-col sm:flex-row hover:border-neon-blue/30 transition-colors">
                <div className="w-full sm:w-2/5 aspect-square bg-black/40 overflow-hidden relative p-4">
                  <div className="absolute top-2 left-2 bg-neon-blue text-carbon-dark font-mono font-bold text-[9px] uppercase tracking-widest px-2 py-1 z-10">
                    New
                  </div>
                  <img 
                    src={image} 
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-110 transition-all duration-500"
                  />
                </div>
                
                <div className="w-full sm:w-3/5 p-6 flex flex-col justify-center">
                  <Link href={`/products/${product.slug}`} className="font-heading font-bold text-xl text-white uppercase tracking-wide mb-2 hover:text-neon-blue transition-colors line-clamp-2">
                    {product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                    {product.description}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-mono font-bold text-xl text-white">${product.price.toFixed(2)}</span>
                    <button className="bg-white/5 hover:bg-neon-blue text-white hover:text-carbon-dark border border-white/10 hover:border-neon-blue p-3 transition-colors">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
