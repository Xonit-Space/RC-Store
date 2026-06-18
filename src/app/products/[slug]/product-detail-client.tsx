"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { submitReview } from "@/actions/product"
import { Heart } from "lucide-react"
import { useCartStore } from "@/store/cart"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useLoading } from "@/components/providers/loading-provider"
import Link from "next/link"

interface ProductDetailClientProps {
  product: any
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { data: session } = useSession()
  const cartStore = useCartStore()
  const { withLoading } = useLoading()

  // Options
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  // UI state
  const [activeTab, setActiveTab] = useState<"details" | "shipping" | "reviews">("details")

  // Initialize defaults
  useEffect(() => {
    if (product?.variants?.length > 0) {
      const first = product.variants[0]
      setSelectedSize(first.size)
      setSelectedColor(first.color)
      setSelectedVariant(first)
    }
  }, [product])

  // Update variant when options change
  useEffect(() => {
    if (!product || !product.variants) return
    const matched = product.variants.find(
      (v: any) => v.size === selectedSize && v.color === selectedColor
    )
    setSelectedVariant(matched || null)
  }, [selectedSize, selectedColor, product])

  const handleAddToCart = async () => {
    if (!product) return
    if (!selectedVariant) {
      toast.error("Please select a size and color")
      return
    }
    const stock = selectedVariant.inventory?.quantity || 0
    if (stock <= 0) {
      toast.error("This item is currently out of stock")
      return
    }

    try {
      await withLoading(
        cartStore.addItem({
          variantId: selectedVariant.id,
          quantity: 1,
          product: {
            id: product.id, name: product.name, price: selectedVariant.price || product.price,
            imageUrl: product.images?.[0] || "/placeholder.svg",
            size: selectedVariant.size, color: selectedVariant.color,
          },
        }, session?.user?.id)
      )
      toast.success("Added to bag")
    } catch (err) {
      toast.error("Failed to add to bag")
    }
  }

  const uniqueSizes = Array.from(new Set(product.variants?.map((v: any) => v.size) || [])) as string[]
  const uniqueColors = (product.variants
    ? Array.from(new Map<string, string>(product.variants.map((v: any) => [v.color, v.colorName || v.color])).entries())
    : []) as [string, string][]

  const currentPrice = selectedVariant?.price || product.price
  const isOutOfStock = (selectedVariant?.inventory?.quantity || 0) <= 0

  return (
    <div className="grid md:grid-cols-12 gap-0 min-h-screen">
      
      {/* ── LEFT: SCROLLING GALLERY ── */}
      <div className="md:col-span-7 bg-muted relative">
        <div className="flex flex-col">
          {product.images?.length > 0 ? (
            product.images.map((img: string, idx: number) => (
              <div key={idx} className="w-full min-h-screen md:min-h-[120vh] relative">
                <Image
                  src={img}
                  alt={`${product.name} - View ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="object-cover"
                  priority={idx === 0}
                />
              </div>
            ))
          ) : (
            <div className="w-full h-screen bg-muted flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No images available</p>
            </div>
          )}
        </div>
        
        {/* Mobile back button overlay */}
        <div className="md:hidden absolute top-6 left-6">
          <Link href="/products" className="text-[10px] tracking-[0.2em] uppercase text-foreground bg-background/80 px-4 py-2 backdrop-blur-md">
            Back
          </Link>
        </div>
      </div>

      {/* ── RIGHT: STICKY DETAILS ── */}
      <div className="md:col-span-5 relative">
        <div className="sticky top-0 h-screen overflow-y-auto px-8 md:px-16 py-12 md:py-32 flex flex-col no-scrollbar">
          
          <div className="flex-1 space-y-12 max-w-md">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                  {product.category?.name}
                </p>
                <button className="text-muted-foreground hover:text-terracotta transition-colors">
                  <Heart strokeWidth={1} className="w-5 h-5" />
                </button>
              </div>
              <h1 className="font-serif text-3xl md:text-5xl font-light text-foreground leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 text-sm pt-2">
                <span className="text-foreground">Rs. {currentPrice.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-muted-foreground line-through">Rs. {product.originalPrice.toLocaleString()}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description || "A masterclass in restraint. Crafted from our signature materials with uncompromising attention to detail, designed to age beautifully over time."}
            </p>

            {/* Selectors */}
            <div className="space-y-8">
              {/* Colors */}
              {uniqueColors.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] tracking-[0.2em] uppercase">
                    <span className="text-foreground">Color</span>
                    <span className="text-muted-foreground">{uniqueColors.find(c => c[0] === selectedColor)?.[1] || "Select"}</span>
                  </div>
                  <div className="flex gap-3">
                    {uniqueColors.map(([hex, name]) => (
                      <button
                        key={hex}
                        onClick={() => setSelectedColor(hex)}
                        aria-label={`Select ${name}`}
                        className={`w-6 h-6 rounded-full transition-all duration-300 ${
                          selectedColor === hex ? "ring-1 ring-offset-2 ring-foreground" : "opacity-70 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {uniqueSizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] tracking-[0.2em] uppercase">
                    <span className="text-foreground">Size</span>
                    <button className="text-muted-foreground hover:text-foreground border-b border-transparent hover:border-foreground transition-colors pb-0.5">
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {uniqueSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 text-[11px] tracking-wider transition-all duration-300 border ${
                          selectedSize === size 
                            ? "border-foreground bg-foreground text-background" 
                            : "border-border/60 text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status & CTA */}
            <div className="space-y-4 pt-4">
              {selectedVariant && isOutOfStock && (
                <p className="text-[10px] tracking-[0.2em] uppercase text-terracotta mb-4">
                  Currently Unavailable
                </p>
              )}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || !selectedVariant}
                className="w-full py-5 bg-foreground text-[11px] tracking-[0.25em] uppercase text-background hover:bg-charcoal transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOutOfStock ? "Out of Stock" : "Add to Bag"}
              </button>
            </div>

            {/* Details Accordion */}
            <div className="pt-8 border-t border-border/40">
              <div className="flex gap-8 mb-8 text-[10px] tracking-[0.2em] uppercase">
                {(["details", "shipping", "reviews"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 border-b transition-colors ${
                      activeTab === tab ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="min-h-[150px] text-sm text-muted-foreground leading-relaxed">
                {activeTab === "details" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p>Composition: 100% Signature Material</p>
                    <p>Made in Atelier</p>
                    <p>Dry clean only. Handle with care to preserve the natural fibers.</p>
                    {product.attributes?.map((attr: any) => (
                      <p key={attr.id}>{attr.name}: {attr.value}</p>
                    ))}
                  </div>
                )}
                {activeTab === "shipping" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p>Complimentary express shipping on all orders.</p>
                    <p>Delivery within 2-4 business days globally.</p>
                    <p>Returns accepted within 14 days of delivery in original condition.</p>
                  </div>
                )}
                {activeTab === "reviews" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {product.reviews?.length > 0 ? (
                      product.reviews.map((rev: any) => (
                        <div key={rev.id} className="border-b border-border/40 pb-4 last:border-0">
                          <p className="text-[10px] tracking-wider uppercase text-foreground mb-2">
                            {rev.user?.name || "Client"}
                          </p>
                          <p>{rev.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p>No reviews yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
