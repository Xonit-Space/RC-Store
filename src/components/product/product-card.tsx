"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useState } from "react"
import { useCartStore } from "@/store/cart"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useLoading } from "@/components/providers/loading-provider"

interface ProductCardProps {
  product: any;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { data: session } = useSession()
  const cartStore = useCartStore()
  const { withLoading } = useLoading()
  const [inWishlist, setInWishlist] = useState(false)

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    setInWishlist(!inWishlist)
  }

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    const defaultVariant = product.variants?.[0]
    if (!defaultVariant) {
      toast.error("No variants available")
      return
    }
    try {
      await withLoading(
        cartStore.addItem({
          variantId: defaultVariant.id,
          quantity: 1,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.images?.[0] || "/placeholder.svg",
            size: defaultVariant.size || "M",
            color: defaultVariant.color || "#000000",
          },
        }, session?.user?.id)
      )
      toast.success(`${product.name} added to bag`)
    } catch {
      toast.error("Could not add to bag")
    }
  }

  return (
    <article className="group">
      <div className="relative overflow-hidden bg-muted mb-4 aspect-[3/4]">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={product.images?.[0] || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
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

        <button
          aria-label="Wishlist"
          onClick={toggleWishlist}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart strokeWidth={1} className={`w-5 h-5 ${inWishlist ? "fill-terracotta text-terracotta" : "text-off-white"}`} />
        </button>

        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={addToCart}
            className="w-full py-3 bg-background/95 text-[10px] tracking-[0.25em] uppercase text-foreground hover:bg-forest hover:text-off-white transition-colors duration-200"
          >
            Add to Bag
          </button>
        </div>
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
}
