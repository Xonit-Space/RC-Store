import Link from "next/link"
import Image from "next/image"
import { memo } from "react"
import { ProductCardActions } from "./product-card-actions"

interface ProductCardProps {
  product: any;
  priority?: boolean;
}

// Phase 7: React.memo — product cards are rendered 12-24 per page grid.
// This prevents unnecessary re-renders when parent state (filters, sort) changes.
export const ProductCard = memo(function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className="group">
      <div className="relative overflow-hidden bg-muted mb-4 aspect-[3/4]">
        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={product.images?.[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={priority}
          />
        </Link>

        {product.originalPrice && (
          <span className="absolute top-3 left-3 text-[9px] tracking-[0.15em] uppercase text-off-white bg-terracotta px-2 py-1">
            Sale
          </span>
        )}
        {product.tags?.includes("new") && !product.originalPrice && (
          <span className="absolute top-3 left-3 text-[9px] tracking-[0.15em] uppercase text-off-white bg-forest px-2 py-1">
            New
          </span>
        )}

        {/* Client-side interactive buttons */}
        <ProductCardActions product={product} />
      </div>

      <div className="space-y-1">
        <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground">
          {product.category?.name}
        </p>
        <h3 className="text-sm font-light text-foreground leading-snug">
          <Link href={`/products/${product.slug}`} className="hover:text-accent transition-colors">
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm text-foreground">Rs. {product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">Rs. {product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </article>
  )
})
