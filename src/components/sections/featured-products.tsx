import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getProductsServer as getProducts } from "@/lib/server-api"
import { ProductCard } from "@/components/product/product-card"

export async function FeaturedProducts() {
  const products = await getProducts({ featured: true, limit: 8 })

  return (
    <section id="new-arrivals" className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background styling for Garage */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
      <div className="container mx-auto px-6 md:px-12 relative z-10">

        {/* Section header */}
        <div className="flex items-end justify-between mb-16 md:mb-20">
          <div className="fade-up-section visible">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-primary inline-block" />
              <p className="text-[12px] font-heading font-bold tracking-[0.3em] uppercase text-primary">
                Top Picks
              </p>
            </div>
            <h2 className="font-heading text-4xl md:text-6xl font-black leading-none tracking-tighter text-foreground dark:text-white uppercase drop-shadow-[0_0_15px_rgba(255, 204, 0,0.3)]">
              Featured Machines
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 text-[12px] font-heading font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-primary hover:drop-shadow-[0_0_8px_rgba(255, 204, 0,0.8)] transition-all group fade-up-section visible"
          >
            Discover Machines
            <ArrowRight strokeWidth={2} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Grid — High contrast machine cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {products.map((product, i) => (
            <div key={product.id} className="fade-up-section visible" style={{ transitionDelay: `${i * 0.1}s` }}>
              <ProductCard product={product} priority={i < 4} />
            </div>
          ))}
        </div>

        {/* Mobile "View All" */}
        <div className="mt-16 flex justify-center md:hidden fade-up-section visible">
          <Link
            href="/products"
            className="flex items-center gap-2 text-[12px] font-heading font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors group border border-border px-6 py-3 glass-dark"
          >
            Discover Machines
            <ArrowRight strokeWidth={2} className="w-4 h-4 group-hover:translate-x-1 transition-transform text-primary" />
          </Link>
        </div>
      </div>
    </section>
  )
}
