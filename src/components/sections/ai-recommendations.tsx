"use client"

import { useState, useEffect } from "react"
import { Sparkles, TrendingUp, Clock, User, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductGridSkeleton } from "@/components/ui/loading-skeleton"
import { useLoading } from "@/components/providers/loading-provider"
import { getRecommendations } from "@/lib/api"
import { useCartStore } from "@/store/cart"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import Link from "next/link"

interface RecommendedProduct {
  id: string
  name: string
  price: number
  slug: string
  images: string[]
  category: {
    name: string
  }
  variants?: any[]
}

interface Recommendations {
  personalized: RecommendedProduct[]
  trending: RecommendedProduct[]
  recentlyViewed: RecommendedProduct[]
}

export function AIRecommendations() {
  const { data: session } = useSession()
  const cartStore = useCartStore()
  const [recommendations, setRecommendations] = useState<Recommendations>({
    personalized: [],
    trending: [],
    recentlyViewed: [],
  })
  const [loading, setLoading] = useState(true)
  const { withLoading } = useLoading()

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await withLoading(getRecommendations())
        setRecommendations(data)
      } catch (error) {
        console.error("Failed to fetch recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [withLoading])

  const addToCart = async (productId: string) => {
    // Look up product in any of the categories
    const allRecs = [
      ...recommendations.personalized,
      ...recommendations.trending,
      ...recommendations.recentlyViewed
    ]
    const product = allRecs.find((p) => p.id === productId)
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
      toast.success(`Successfully added ${product.name} to your shopping bag!`)
    } catch (err) {
      toast.error("Failed to add garment to cart")
    }
  }

  const RecommendationCard = ({ product }: { product: RecommendedProduct }) => (
    <Card className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-slate-100 rounded-2xl bg-card overflow-hidden">
      <CardContent className="p-4">
        <div className="aspect-square mb-3 overflow-hidden rounded-xl bg-slate-50 relative">
          <Link href={`/products/${product.slug}`} className="block w-full h-full">
            <img
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </Link>
        </div>
        <div className="space-y-2">
          <h4 className="font-extrabold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-primary transition min-h-10">
            <Link href={`/products/${product.slug}`}>
              {product.name}
            </Link>
          </h4>
          <Badge variant="outline" className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
            {product.category.name}
          </Badge>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-extrabold text-slate-900">Rs. {product.price.toLocaleString()}</span>
            <Badge variant="secondary" className="text-[9px] font-extrabold uppercase bg-purple-50 text-purple-700 border-purple-100 animate-pulse">
              AI Pick
            </Badge>
          </div>
          <Button
            size="sm"
            className="w-full bg-slate-900 text-white font-bold rounded-xl h-9.5 text-xs shadow-md mt-2 hover:bg-slate-800 active:scale-95 transition"
            onClick={() => addToCart(product.id)}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
              <h2 className="text-3xl md:text-4xl font-bold">AI-Powered Recommendations</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our advanced AI analyzes your preferences and behavior to suggest products you&apos;ll love
            </p>
          </div>
          <ProductGridSkeleton count={4} />
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-muted/30 font-sans border-t border-slate-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800">AI-Powered Recommendations</h2>
          </div>
          <p className="text-slate-400 font-semibold max-w-2xl mx-auto text-xs">
            Our advanced AI analyzes your preferences and behavior to suggest products you&apos;ll love
          </p>
        </div>

        <Tabs defaultValue="personalized" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="personalized" className="flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="h-4 w-4" />
              For You
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Clock className="h-4 w-4" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personalized" className="animate-in fade-in-50 duration-300 outline-none">
            <Card className="border border-slate-100 shadow-sm rounded-3xl p-6 bg-white">
              <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Personalized for You</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.personalized.map((product) => (
                    <RecommendationCard key={product.id} product={product} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending" className="animate-in fade-in-50 duration-300 outline-none">
            <Card className="border border-slate-100 shadow-sm rounded-3xl p-6 bg-white">
              <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Trending Now</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.trending.map((product) => (
                    <RecommendationCard key={product.id} product={product} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="animate-in fade-in-50 duration-300 outline-none">
            <Card className="border border-slate-100 shadow-sm rounded-3xl p-6 bg-white">
              <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Recently Viewed</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.recentlyViewed.map((product) => (
                    <RecommendationCard key={product.id} product={product} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
