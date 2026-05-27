export const dynamic = "force-dynamic"

import { Header } from "@/components/layout/header"
import { HeroSection } from "@/components/sections/hero-section"
import { SeasonalCollectionSection } from "@/components/sections/seasonal-collection-section"
import { FeaturedProducts } from "@/components/sections/featured-products"
import { MaterialsSection } from "@/components/sections/materials-section"
import { BrandStorySection } from "@/components/sections/brand-story-section"
import { MembershipSection } from "@/components/sections/membership-section"
import { NewsletterSection } from "@/components/sections/newsletter-section"
import { Footer } from "@/components/layout/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Transparent fixed nav — sits above the full-bleed hero */}
      <Header />

      <main>
        {/* 1. Cinematic full-viewport video hero */}
        <HeroSection />

        {/* 2. Seasonal Collections — asymmetric editorial grid */}
        <SeasonalCollectionSection />

        {/* 3. New Arrivals — 4-column image-first editorial grid */}
        <FeaturedProducts />

        {/* 4. Signature Materials — provenance storytelling */}
        <MaterialsSection />

        {/* 5. Brand Story — split editorial layout */}
        <BrandStorySection />

        {/* 6. Private Membership — deep forest green */}
        <MembershipSection />

        {/* 7. Newsletter — minimal underline input */}
        <NewsletterSection />
      </main>

      <Footer />
    </div>
  )
}

