"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useTransition, useCallback, memo } from "react"
import { useRouter } from "next/navigation"

interface AddToCartClientButtonProps {
  productId: string
  productName: string
  price: number
  imageUrl: string
  variantId: string
  size: string
  color: string
}

// Phase 7: memo + useCallback to prevent re-renders in AI Recommendations grid
export const AddToCartClientButton = memo(function AddToCartClientButton({
  productId,
  productName,
  price,
  imageUrl,
  variantId,
  size,
  color
}: AddToCartClientButtonProps) {
  const { data: session } = useSession()
  const cartStore = useCartStore()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleAddToCart = useCallback(() => {
    if (!session) {
      toast.error("Please sign in to add items to your cart", { 
        className: "bg-background text-primary border-destructive" 
      })
      router.push("/login")
      return
    }

    startTransition(async () => {
      try {
        await cartStore.addItem(
          {
            variantId,
            quantity: 1,
            product: {
              id: productId,
              name: productName,
              price: price,
              imageUrl: imageUrl,
              size: size,
              color: color,
            },
          },
          session?.user?.id
        )
        toast.success(`Successfully added ${productName} to your shopping bag!`)
      } catch (err) {
        toast.error("Failed to add garment to cart")
      }
    })
  }, [variantId, productId, productName, price, imageUrl, size, color, cartStore, session?.user?.id])

  return (
    <Button
      size="sm"
      className="w-full bg-foreground text-foreground font-bold rounded-none h-9.5 text-xs shadow-md mt-2 hover:bg-foreground active:scale-95 transition"
      onClick={handleAddToCart}
      disabled={isPending}
    >
      <ShoppingCart className="h-4 w-4 mr-1.5" />
      {isPending ? "Adding..." : "Add to Cart"}
    </Button>
  )
})
