"use client"

import { useState, useEffect } from "react"
import { Star, Heart, ShoppingCart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductGridSkeleton } from "@/components/ui/loading-skeleton"
import { useLoading } from "@/components/providers/loading-provider"
import { getProducts } from "@/lib/api"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  averageRating: number
  reviewCount: number
  images: string[]
  category: {
    name: string
  }
  isFeatured: boolean
  tags: string[]
}

export function FeaturedProducts() {
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
    setWishlist((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  const addToCart = async (productId: string) => {
    await withLoading(
      new Promise((resolve) => setTimeout(resolve, 1000)), // Simulate API call
    )
    // Add to cart logic here
    console.log("Added to cart:", productId)
  }

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of premium products, curated just for you
            </p>
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of premium products, curated just for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.tags.includes("new") && (
                    <Badge className="bg-green-500 hover:bg-green-600 animate-pulse">New</Badge>
                  )}
                  {product.originalPrice && (
                    <Badge className="bg-red-500 hover:bg-red-600">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </Badge>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 backdrop-blur-sm"
                    onClick={() => toggleWishlist(product.id)}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : ""}`}
                    />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 backdrop-blur-sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>

                {/* Add to Cart - Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Button className="w-full backdrop-blur-sm" size="sm" onClick={() => addToCart(product.id)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    {product.category.name}
                  </Badge>

                  <h3 className="font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(product.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="group">
            View All Products
            <ShoppingCart className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}
