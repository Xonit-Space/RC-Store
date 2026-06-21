import { Cpu, Activity, Zap, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getRecommendations } from "@/lib/api"
import { ProductCard } from "@/components/product/product-card"

export async function AIRecommendations() {
  // Fetch recommendations on the server
  const recommendations = await getRecommendations()

  return (
    <section className="py-20 bg-slate-100 dark:bg-smoke-dark font-sans relative overflow-hidden border-t border-border">
      {/* Animated Radar Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-racing-red/20 opacity-20 pointer-events-none">
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-racing-red/50 animate-radar-scan origin-bottom" />
        <div className="absolute inset-0 rounded-full border border-racing-red/10 scale-75" />
        <div className="absolute inset-0 rounded-full border border-racing-red/10 scale-50" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 fade-up-section visible">
          <div className="flex flex-col items-center justify-center gap-3 mb-6">
            <Cpu className="h-10 w-10 text-racing-red animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tighter text-foreground dark:text-white uppercase drop-shadow-[0_0_10px_rgba(255,30,30,0.5)]">
              Racing Intelligence System
            </h2>
          </div>
          <p className="text-muted-foreground font-mono tracking-widest max-w-2xl mx-auto text-xs uppercase border border-border glass-dark py-2 px-4 inline-block">
            System analyzing telemetry data... [MATCH FOUND]
          </p>
        </div>

        <Tabs defaultValue="personalized" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto mb-10 bg-black/50 border border-border p-1 rounded-none">
            <TabsTrigger value="personalized" className="flex items-center justify-center gap-2 text-xs font-heading font-bold py-3 rounded-none data-[state=active]:bg-racing-red data-[state=active]:text-foreground dark:text-white data-[state=active]:shadow-[0_0_15px_rgba(255,30,30,0.5)] uppercase tracking-wider transition-all">
              <Zap className="h-4 w-4" />
              Pilot Match
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center justify-center gap-2 text-xs font-heading font-bold py-3 rounded-none data-[state=active]:bg-racing-red data-[state=active]:text-foreground dark:text-white data-[state=active]:shadow-[0_0_15px_rgba(255,30,30,0.5)] uppercase tracking-wider transition-all">
              <Activity className="h-4 w-4" />
              Trending Tech
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center justify-center gap-2 text-xs font-heading font-bold py-3 rounded-none data-[state=active]:bg-racing-red data-[state=active]:text-foreground dark:text-white data-[state=active]:shadow-[0_0_15px_rgba(255,30,30,0.5)] uppercase tracking-wider transition-all">
              <ShieldAlert className="h-4 w-4" />
              Recent Scans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personalized" className="animate-in fade-in-50 duration-500 outline-none">
            <div className="border border-racing-red/20 shadow-[0_0_30px_rgba(255,30,30,0.05)] rounded-none p-6 md:p-8 bg-background/80 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                <Zap className="h-6 w-6 text-racing-red" />
                <h3 className="text-lg font-heading font-black text-foreground dark:text-white uppercase tracking-widest">Calculated For Your Driving Style</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {recommendations.personalized?.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trending" className="animate-in fade-in-50 duration-500 outline-none">
            <div className="border border-racing-red/20 shadow-[0_0_30px_rgba(255,30,30,0.05)] rounded-none p-6 md:p-8 bg-background/80 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                <Activity className="h-6 w-6 text-racing-red" />
                <h3 className="text-lg font-heading font-black text-foreground dark:text-white uppercase tracking-widest">High Performance Trending</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {recommendations.trending?.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="animate-in fade-in-50 duration-500 outline-none">
            <div className="border border-racing-red/20 shadow-[0_0_30px_rgba(255,30,30,0.05)] rounded-none p-6 md:p-8 bg-background/80 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                <ShieldAlert className="h-6 w-6 text-racing-red" />
                <h3 className="text-lg font-heading font-black text-foreground dark:text-white uppercase tracking-widest">Previously Scanned Models</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {recommendations.recentlyViewed?.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
