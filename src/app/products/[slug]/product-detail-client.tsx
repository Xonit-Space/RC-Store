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
import { useRouter } from "next/navigation"
import { WishlistButton } from "@/components/product/wishlist-button"
import { ProductSidebarRelated } from "@/components/product/product-sidebar-related"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductContentSections } from "@/components/product/product-content-sections"
import { ShieldCheck, Truck, RotateCcw, CreditCard } from "lucide-react"

interface ProductDetailClientProps {
  product: any
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { data: session } = useSession()
  const cartStore = useCartStore()
  const { withLoading } = useLoading()
  const router = useRouter()

  // Options
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)

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
    if (!session) {
      toast.error("CONNECTION DENIED: You must be authenticated to request supplies.", {
        className: "bg-background text-primary border-destructive"
      })
      router.push("/login")
      return
    }

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
      const promises = []
      
      // Add main product
      promises.push(
        cartStore.addItem({
          variantId: selectedVariant.id,
          quantity: quantity,
          product: {
            id: product.id, name: product.name, price: selectedVariant.price || product.price,
            imageUrl: product.images?.[0] || "/placeholder.svg",
            size: selectedVariant.size, color: selectedVariant.color,
          },
        }, session?.user?.id)
      )

      // Add selected addons
      for (const addonId of selectedAddons) {
        const addonObj = product.productAddons?.find((pa: any) => pa.addon.id === addonId)?.addon
        if (addonObj) {
          promises.push(
            cartStore.addItem({
              addonId: addonObj.id,
              parentProductId: product.id,
              quantity: 1,
              product: {
                id: addonObj.id, 
                name: `${product.name} - ${addonObj.name}`, 
                price: addonObj.price,
                imageUrl: addonObj.image || product.images?.[0] || "/placeholder.svg",
                size: "", color: "",
              },
            }, session?.user?.id)
          )
        }
      }

      await withLoading(Promise.all(promises))
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
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addonPrice = product.productAddons?.find((pa: any) => pa.addon.id === addonId)?.addon?.price || 0
    return sum + Number(addonPrice)
  }, 0)
  const displayPrice = Number(currentPrice) + addonsTotal
  const isOutOfStock = (selectedVariant?.inventory?.quantity || 0) <= 0

  return (
    <div className="flex flex-col min-h-screen pt-4 pb-24">
      {/* ── TOP SECTION: GALLERY & PURCHASE ── */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 w-full max-w-7xl mx-auto px-4 md:px-8 mb-16">
        
        {/* Left: Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images || []} productName={product.name} />
        </div>

      {/* Right: Info & Purchase */}
      <div className="lg:col-span-5 relative">
        <div className="flex flex-col space-y-12">
          
          <div className="flex-1 space-y-12 max-w-md">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                  {product.category?.name}
                </p>
                <WishlistButton productId={product.id} variant="minimal" />
              </div>
              <h1 className="font-serif text-3xl md:text-5xl font-light text-foreground leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4">
                {product.averageRating > 0 && (
                  <a
                    href="#reviews"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }}
                    className="flex items-center gap-1 group cursor-pointer"
                  >
                    <div className="flex text-primary group-hover:text-primary/70 transition-colors">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-sm">{i < Math.round(product.averageRating) ? "★" : "☆"}</span>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-1 group-hover:underline">({product.reviewCount} Reviews)</span>
                  </a>
                )}
                {product.variants?.[0]?.sku && (
                  <div className="text-xs text-muted-foreground font-mono">
                    SKU: {selectedVariant?.sku || product.variants[0].sku}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm pt-2">
                <span className="text-foreground">{displayPrice.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</span>
                {product.originalPrice && (
                  <span className="text-muted-foreground line-through">{product.originalPrice.toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</span>
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

              {/* Addons */}
              {product.productAddons?.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <div className="text-[10px] tracking-[0.2em] uppercase text-foreground">
                    Optional Extras
                  </div>
                  <div className="space-y-3">
                    {product.productAddons.map(({ addon }: any) => {
                      const isSelected = selectedAddons.includes(addon.id)
                      return (
                        <label 
                          key={addon.id} 
                          className={`flex items-start gap-4 p-4 border transition-all cursor-pointer ${
                            isSelected 
                              ? "border-foreground bg-muted/20" 
                              : "border-border/40 hover:border-foreground/40"
                          }`}
                        >
                          <div className="mt-0.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedAddons([...selectedAddons, addon.id])
                                else setSelectedAddons(selectedAddons.filter(id => id !== addon.id))
                              }}
                              className="w-4 h-4 rounded-sm border-border bg-transparent text-foreground focus:ring-0 focus:ring-offset-0"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-foreground">{addon.name}</span>
                              <span className="text-sm text-foreground">+ {Number(addon.price).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</span>
                            </div>
                            {addon.description && (
                              <p className="text-xs text-muted-foreground mt-1">{addon.description}</p>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Purchase Options */}
            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <div className="flex items-center border border-border/40 bg-transparent h-12 w-32">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center text-sm font-mono">{quantity}</div>
                  <button 
                    onClick={() => setQuantity(Math.min((selectedVariant?.inventory?.quantity || 10), quantity + 1))}
                    className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || !selectedVariant}
                  className="flex-1 h-12 bg-foreground text-[11px] tracking-[0.25em] uppercase text-background hover:bg-charcoal transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOutOfStock ? "Out of Stock" : "Add to Bag"}
                </button>
              </div>

              {/* Inventory Urgency Indicator */}
              {selectedVariant && (() => {
                const stock = selectedVariant.inventory?.quantity || 0
                if (stock <= 0) return null
                if (stock <= 5) return (
                  <p className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Only {stock} left in stock — order soon!
                  </p>
                )
                if (stock <= 15) return (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                    {stock} units in stock
                  </p>
                )
                return null
              })()}

              {/* Part Finder Cross-link */}
              <div className="pt-3 border-t border-border/30">
                <Link
                  href="/part-finder"
                  className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  Looking for compatible parts? Use our Part Finder
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>

              {/* Payment & Trust Badges */}
              <div className="pt-6 space-y-4 border-t border-border/40">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <CreditCard className="w-4 h-4 text-foreground" />
                  <span>Pay in 4 interest-free payments of <strong>{(displayPrice / 4).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</strong></span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="w-4 h-4 text-foreground" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-foreground" />
                    <span>1 Year Warranty</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <RotateCcw className="w-4 h-4 text-foreground" />
                    <span>30-Day Returns</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar Related Products */}
            <ProductSidebarRelated relatedProducts={product.relatedSource} />
          </div>
        </div>
      </div>
      </div>

      {/* ── LOWER SECTION: CONTENT BLOCKS ── */}
      <ProductContentSections product={product} />
    </div>
  )
}
