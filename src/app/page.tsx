export const dynamic = "force-dynamic"

import { Suspense } from "react"
import nextDynamic from "next/dynamic"
import { Header } from "@/components/layout/header"
import { HeroSection } from "@/components/sections/hero-section"
import { ProductGridSkeleton } from "@/components/ui/loading-skeleton"

// Phase 3: Lazy load below-the-fold components
const SeasonalCollectionSection = nextDynamic(() => import("@/components/sections/seasonal-collection-section").then(mod => mod.SeasonalCollectionSection))
const FeaturedProducts = nextDynamic(() => import("@/components/sections/featured-products").then(mod => mod.FeaturedProducts))
const MaterialsSection = nextDynamic(() => import("@/components/sections/materials-section").then(mod => mod.MaterialsSection))
const BrandStorySection = nextDynamic(() => import("@/components/sections/brand-story-section").then(mod => mod.BrandStorySection))
const MembershipSection = nextDynamic(() => import("@/components/sections/membership-section").then(mod => mod.MembershipSection))
const NewsletterSection = nextDynamic(() => import("@/components/sections/newsletter-section").then(mod => mod.NewsletterSection))
const AIRecommendations = nextDynamic(() => import("@/components/sections/ai-recommendations").then(mod => mod.AIRecommendations))
const Footer = nextDynamic(() => import("@/components/layout/footer").then(mod => mod.Footer))

// Simple skeleton for sections
function SectionSkeleton({ heightClass = "h-96" }) {
  return <div className={`w-full ${heightClass} bg-muted/20 animate-pulse`} />
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Transparent fixed nav — sits above the full-bleed hero */}
      <Header />

      <main>
        {/* 1. Cinematic full-viewport video hero */}
        <Suspense fallback={<SectionSkeleton heightClass="h-screen" />}>
          <HeroSection />
        </Suspense>

        {/* 2. Seasonal Collections — asymmetric editorial grid */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[600px]" />}>
          <SeasonalCollectionSection />
        </Suspense>

        {/* 3. New Arrivals — 4-column image-first editorial grid */}
        <Suspense fallback={<div className="container mx-auto px-4 py-24"><ProductGridSkeleton count={4} /></div>}>
          <FeaturedProducts />
        </Suspense>

        {/* AI Recommendations */}
        <Suspense fallback={<div className="container mx-auto px-4 py-24"><ProductGridSkeleton count={4} /></div>}>
          <AIRecommendations />
        </Suspense>

        {/* 4. Signature Materials — provenance storytelling */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[500px]" />}>
          <MaterialsSection />
        </Suspense>

        {/* 5. Brand Story — split editorial layout */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[500px]" />}>
          <BrandStorySection />
        </Suspense>

        {/* 6. Private Membership — deep forest green */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[400px]" />}>
          <MembershipSection />
        </Suspense>

        {/* 7. Newsletter — minimal underline input */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[300px]" />}>
          <NewsletterSection />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
