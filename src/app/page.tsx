import { Header } from "@/components/layout/header"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturedProducts } from "@/components/sections/featured-products"
import { AIRecommendations } from "@/components/sections/ai-recommendations"
import { Footer } from "@/components/layout/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <AIRecommendations />
      </main>
      <Footer />
    </div>
  )
}
