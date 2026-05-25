"use client"

import { useState, useEffect } from "react"
import { Sparkles, TrendingUp, Clock, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductGridSkeleton } from "@/components/ui/loading-skeleton"
import { useLoading } from "@/components/providers/loading-provider"
import { getRecommendations } from "@/lib/api"

interface RecommendedProduct {
  id: string
  name: string
  price: number
  images: string[]
  category: {
    name: string
  }
}

interface Recommendations {
  personalized: RecommendedProduct[]
  trending: RecommendedProduct[]
  recentlyViewed: RecommendedProduct[]
}

export function AIRecommendations() {
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
    await withLoading(new Promise((resolve) => setTimeout(resolve, 800)))
    console.log("Added to cart:", productId)
  }

  const RecommendationCard = ({ product }: { product: RecommendedProduct }) => (
    <Card className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-4">
        <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="space-y-2">
          <h4 className="font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">{product.name}</h4>
          <p className="text-sm text-muted-foreground">{product.category.name}</p>
          <div className="flex items-center justify-between">
            <span className="font-bold">${product.price}</span>
            <Badge variant="secondary" className="text-xs animate-pulse">
              AI Pick
            </Badge>
          </div>
          <Button
            size="sm"
            className="w-full group-hover:bg-blue-600 transition-colors"
            onClick={() => addToCart(product.id)}
          >
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
              Our advanced AI analyzes your preferences and behavior to suggest products you'll love
            </p>
          </div>
          <ProductGridSkeleton count={4} />
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold">AI-Powered Recommendations</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our advanced AI analyzes your preferences and behavior to suggest products you'll love
          </p>
        </div>

        <Tabs defaultValue="personalized" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="personalized" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              For You
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personalized" className="animate-in fade-in-50 duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Personalized for You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendations.personalized.map((product) => (
                    <RecommendationCard key={product.id} product={product} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending" className="animate-in fade-in-50 duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendations.trending.map((product) => (
                    <RecommendationCard key={product.id} product={product} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="animate-in fade-in-50 duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Recently Viewed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
