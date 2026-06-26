import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

interface ProductSidebarRelatedProps {
  relatedProducts: any[] // From relatedSource or similar
}

export function ProductSidebarRelated({ relatedProducts }: ProductSidebarRelatedProps) {
  if (!relatedProducts || relatedProducts.length === 0) return null

  return (
    <div className="pt-8 border-t border-border/40 mt-8">
      <h3 className="text-[10px] tracking-[0.2em] uppercase text-foreground mb-6 font-bold">
        Compatible Parts & Upgrades
      </h3>
      
      <div className="flex flex-col gap-4">
        {relatedProducts.slice(0, 4).map((item) => {
          const product = item.related || item
          const imageUrl = product.images?.[0]?.url || product.images?.[0] || "/placeholder.svg"
          const price = typeof product.price === 'object' ? product.price.toNumber() : Number(product.price)
          
          return (
            <Link 
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex gap-4 p-3 border border-border/40 hover:border-foreground/40 transition-colors bg-muted/10 items-center"
            >
              <div className="relative w-16 h-16 shrink-0 bg-muted">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all"
                  sizes="64px"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {product.name}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                  Rs. {price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center shrink-0 group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-all">
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
