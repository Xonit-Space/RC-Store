import { Sparkles, TrendingUp, Clock, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getRecommendations } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"
import { AddToCartClientButton } from "@/components/product/add-to-cart-button"

export async function AIRecommendations() {
  // Fetch recommendations on the server
  const recommendations = await getRecommendations()

  const RecommendationCard = ({ product }: { product: any }) => {
    const defaultVariant = product.variants?.[0]
    const variantId = defaultVariant?.id || ""
    const size = defaultVariant?.size || "M"
    const color = defaultVariant?.color || "#000000"

    return (
      <Card className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-muted/10 rounded-none bg-card overflow-hidden">
        <CardContent className="p-4">
          <div className="aspect-square mb-3 overflow-hidden rounded-none bg-muted/5 relative">
            <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </Link>
          </div>
          <div className="space-y-2">
            <h4 className="font-extrabold text-foreground text-sm line-clamp-2 leading-snug group-hover:text-primary transition min-h-10">
              <Link href={`/products/${product.slug}`}>
                {product.name}
              </Link>
            </h4>
            <Badge variant="outline" className="text-[10px] font-extrabold text-foreground uppercase tracking-widest bg-foreground border border-foreground px-2 py-0.5 rounded">
              {product.category?.name || "Apparel"}
            </Badge>
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-extrabold text-foreground">Rs. {product.price.toLocaleString()}</span>
              <Badge variant="secondary" className="text-[9px] font-extrabold uppercase bg-foreground text-foreground border-foreground animate-pulse">
                AI Pick
              </Badge>
            </div>
            
            <AddToCartClientButton
              productId={product.id}
              productName={product.name}
              price={product.price}
              imageUrl={product.images?.[0] || "/placeholder.svg"}
              variantId={variantId}
              size={size}
              color={color}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="py-16 bg-muted/30 font-sans border-t border-muted/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-foreground animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">AI-Powered Recommendations</h2>
          </div>
          <p className="text-muted-foreground font-semibold max-w-2xl mx-auto text-xs">
            Our advanced AI analyzes your preferences and behavior to suggest products you&apos;ll love
          </p>
        </div>

        <Tabs defaultValue="personalized" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8 bg-muted/10 p-1 rounded-none">
            <TabsTrigger value="personalized" className="flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="h-4 w-4" />
              For You
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Clock className="h-4 w-4" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personalized" className="animate-in fade-in-50 duration-300 outline-none">
            <Card className="border border-muted/10 shadow-sm rounded-3xl p-6 bg-white">
              <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center gap-2">
                <Sparkles className="h-5 w-5 text-foreground" />
                <div>
                  <CardTitle className="text-sm font-extrabold text-foreground uppercase tracking-wider">Personalized for You</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.personalized?.map((product: any) => (
                    <RecommendationCard key={product.id} product={product} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending" className="animate-in fade-in-50 duration-300 outline-none">
            <Card className="border border-muted/10 shadow-sm rounded-3xl p-6 bg-white">
              <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <CardTitle className="text-sm font-extrabold text-foreground uppercase tracking-wider">Trending Now</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.trending?.map((product: any) => (
                    <RecommendationCard key={product.id} product={product} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="animate-in fade-in-50 duration-300 outline-none">
            <Card className="border border-muted/10 shadow-sm rounded-3xl p-6 bg-white">
              <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center gap-2">
                <Clock className="h-5 w-5 text-foreground" />
                <div>
                  <CardTitle className="text-sm font-extrabold text-foreground uppercase tracking-wider">Recently Viewed</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.recentlyViewed?.map((product: any) => (
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
