import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getProductsServer as getProducts } from "@/lib/server-api"
import { ProductCard } from "@/components/product/product-card"

export async function FeaturedProducts() {
  const products = await getProducts({ featured: true, limit: 8 })

  return (
    <section id="new-arrivals" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 md:px-12">

        {/* Section header */}
        <div className="flex items-end justify-between mb-16 md:mb-20">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Curated Selection
            </p>
            <h2 className="font-serif text-4xl md:text-6xl font-light leading-none tracking-tight text-foreground">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors group"
          >
            View All
            <ArrowRight strokeWidth={1} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Grid — editorial image-first layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>

        {/* Mobile "View All" */}
        <div className="mt-16 flex justify-center md:hidden">
          <Link
            href="/products"
            className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors group"
          >
            View All
            <ArrowRight strokeWidth={1} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
