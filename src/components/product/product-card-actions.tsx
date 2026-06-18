"use client"

import { useState, useCallback, memo } from "react"
import { Heart } from "lucide-react"
import { useCartStore } from "@/store/cart"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface ProductCardActionsProps {
  product: any;
}

// Phase 7: memo prevents re-render when parent re-renders with unchanged product prop
export const ProductCardActions = memo(function ProductCardActions({ product }: ProductCardActionsProps) {
  const { data: session } = useSession()
  const cartStore = useCartStore()
  const [inWishlist, setInWishlist] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Phase 7: Stable handler reference - won't cause child re-renders
  const toggleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setInWishlist(prev => !prev)
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist")
  }, [inWishlist])

  const addToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    const defaultVariant = product.variants?.[0]
    if (!defaultVariant) {
      toast.error("No variants available")
      return
    }
    
    setIsAdding(true)
    try {
      await cartStore.addItem({
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
      toast.success(`${product.name} added to bag`)
    } catch {
      toast.error("Could not add to bag")
    } finally {
      setIsAdding(false)
    }
  }, [product, cartStore, session?.user?.id])

  return (
    <>
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
          disabled={isAdding}
          className="w-full py-3 bg-background/95 text-[10px] tracking-[0.25em] uppercase text-foreground hover:bg-forest hover:text-off-white transition-colors duration-200"
        >
          {isAdding ? "Adding..." : "Add to Bag"}
        </button>
      </div>
    </>
  )
})
