"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Heart } from "lucide-react"
import { ProductGridSkeleton } from "@/components/ui/loading-skeleton"
import { useLoading } from "@/components/providers/loading-provider"
import { getProducts } from "@/lib/api"
import { useCartStore } from "@/store/cart"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  slug: string
  originalPrice?: number | null
  averageRating: number
  reviewCount: number
  images: string[]
  category: { name: string }
  isFeatured: boolean
  tags: string[]
  variants?: any[]
}

export function FeaturedProducts() {
  const { data: session } = useSession()
  const cartStore = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { withLoading } = useLoading()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await withLoading(getProducts({ featured: true, limit: 8 }))
        setProducts(data)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [withLoading])

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const addToCart = async (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    const defaultVariant = product.variants?.[0]
    if (!defaultVariant) {
      toast.error("No active variants available for this item")
      return
    }
    try {
      await withLoading(
        cartStore.addItem(
          {
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
          },
          session?.user?.id
        )
      )
      toast.success(`${product.name} added to bag`)
    } catch {
      toast.error("Failed to add to bag")
    }
  }

  if (loading) {
    return (
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <ProductGridSkeleton count={8} />
        </div>
      </section>
    )
  }

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
            <article
              key={product.id}
              className="group"
              /* Slight stagger via inline delay would require framer; CSS is sufficient here */
            >
              {/* Image Container */}
              <div className="relative overflow-hidden bg-muted mb-4 aspect-[3/4]">
                <Link href={`/products/${product.slug}`} className="block w-full h-full">
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading={i < 4 ? "eager" : "lazy"}
                  />
                </Link>

                {/* Sale tag — minimal, no neon */}
                {product.originalPrice && (
                  <span className="absolute top-3 left-3 text-[9px] tracking-[0.15em] uppercase text-off-white bg-terracotta px-2 py-1">
                    Sale
                  </span>
                )}

                {/* New tag */}
                {product.tags.includes("new") && !product.originalPrice && (
                  <span className="absolute top-3 left-3 text-[9px] tracking-[0.15em] uppercase text-off-white bg-forest px-2 py-1">
                    New
                  </span>
                )}

                {/* Wishlist — top right, appears on hover */}
                <button
                  aria-label="Add to wishlist"
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Heart
                    strokeWidth={1}
                    className={`w-5 h-5 transition-colors ${
                      wishlist.includes(product.id)
                        ? "fill-terracotta text-terracotta"
                        : "text-off-white"
                    }`}
                  />
                </button>

                {/* Quick add — slide up from bottom */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button
                    onClick={() => addToCart(product.id)}
                    className="w-full py-3 bg-background/95 text-[10px] tracking-[0.25em] uppercase text-foreground hover:bg-forest hover:text-off-white transition-colors duration-200"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground">
                  {product.category.name}
                </p>
                <h3 className="text-sm font-light text-foreground leading-snug">
                  <Link href={`/products/${product.slug}`} className="hover:text-accent transition-colors">
                    {product.name}
                  </Link>
                </h3>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-sm text-foreground">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      Rs. {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </article>
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


