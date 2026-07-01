"use client"

import { ShoppingCart } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cart"
import { toast } from "sonner"
import { useState } from "react"

export function CartIconButton({ product, className, children }: { product?: any, className?: string, children?: React.ReactNode }) {
  const { data: session } = useSession()
  const router = useRouter()
  const cartStore = useCartStore()
  const [loading, setLoading] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error("Please sign in to add items to your cart", { 
        className: "bg-background text-primary border-destructive" 
      })
      router.push("/login")
      return
    }

    if (!product) {
      toast.error("This is a demo product. No supply lines established.", { 
        className: "bg-background text-primary border-destructive" 
      })
      return
    }

    setLoading(true)
    try {
      const variantId = product.variants?.[0]?.id || `var_${product.id}`
      await cartStore.addItem(
        {
          variantId,
          quantity: 1,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url || "",
            size: "Standard",
            color: "Standard",
          },
        },
        session?.user?.id
      )
      toast.success(`${product.name} loaded into transport.`, {
        className: "bg-background text-emerald-500 border-emerald-500"
      })
    } catch (err) {
      toast.error("SYSTEM MALFUNCTION: Failed to add item.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleAddToCart}
      disabled={loading}
      className={className || "relative z-20 w-10 h-10 bg-muted/50 border border-border flex items-center justify-center text-foreground hover:bg-racing-yellow hover:text-carbon-dark hover:border-primary transition-all disabled:opacity-50"}
    >
      {children || <ShoppingCart className="w-4 h-4" />}
    </button>
  )
}
