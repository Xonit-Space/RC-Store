"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { toggleWishlist } from "@/actions/wishlist"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function WishlistButton({ productId, className, variant = "default" }: { productId: string, className?: string, variant?: "default" | "minimal" }) {
  const { status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (status === "unauthenticated") {
      toast.error("Please login to use wishlist")
      router.push("/login")
      return
    }

    setLoading(true)
    const res = await toggleWishlist(productId)
    if (res.success) {
      toast.success(res.action === "added" ? "Added to wishlist" : "Removed from wishlist")
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  const baseStyles = variant === "minimal" 
    ? "text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
    : "relative z-20 w-8 h-8 bg-carbon-dark/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-colors disabled:opacity-50";

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`${baseStyles} ${className || ""}`}
    >
      <Heart className={variant === "minimal" ? "w-5 h-5" : "w-4 h-4"} />
    </button>
  )
}
