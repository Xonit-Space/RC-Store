// ISR disabled — root layout uses per-request CSP nonces via middleware.
import { Suspense } from "react"
import nextDynamic from "next/dynamic"

// Eager components for LCP
import { HeroSection } from "@/components/sections/hero-section"

// Lazy loaded below-the-fold components
const FeaturedProductCard = nextDynamic(() => import("@/components/sections/featured-product-card").then(m => m.FeaturedProductCard))
const TrustHighlights = nextDynamic(() => import("@/components/sections/trust-highlights").then(m => m.TrustHighlights))
const ShopCategories = nextDynamic(() => import("@/components/sections/shop-categories").then(m => m.ShopCategories))
const BestSellersTabs = nextDynamic(() => import("@/components/sections/best-sellers-tabs").then(m => m.BestSellersTabs))
const BrandShowcase = nextDynamic(() => import("@/components/sections/brand-showcase").then(m => m.BrandShowcase))
const PartFinderBanner = nextDynamic(() => import("@/components/sections/part-finder-banner").then(m => m.PartFinderBanner))
const StaffPicks = nextDynamic(() => import("@/components/sections/staff-picks").then(m => m.StaffPicks))
const NewReleases = nextDynamic(() => import("@/components/sections/new-releases").then(m => m.NewReleases))
const CustomerGallery = nextDynamic(() => import("@/components/sections/customer-gallery").then(m => m.CustomerGallery))
const NewsletterSection = nextDynamic(() => import("@/components/sections/newsletter-section").then(m => m.NewsletterSection))
const SeoAboutContent = nextDynamic(() => import("@/components/sections/seo-about-content").then(m => m.SeoAboutContent))
const Footer = nextDynamic(() => import("@/components/layout/footer").then(m => m.Footer))

function SectionSkeleton({ heightClass = "h-96" }) {
  return <div className={`w-full ${heightClass} bg-smoke-dark animate-pulse`} />
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 1 & 2. Announcement Bar & Header */}
      
      <main>
        {/* 3. Hero Banner (LCP) */}
        <HeroSection />

        {/* 4. Featured Product */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[600px]" />}>
          <FeaturedProductCard />
        </Suspense>

        {/* 5. Trust / Service Highlights */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[200px]" />}>
          <TrustHighlights />
        </Suspense>

        {/* 6. Shop Categories */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[800px]" />}>
          <ShopCategories />
        </Suspense>

        {/* 7. Best Sellers */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[600px]" />}>
          <BestSellersTabs />
        </Suspense>

        {/* 8. Brand Showcase */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[200px]" />}>
          <BrandShowcase />
        </Suspense>

        {/* 9. Part Finder Banner */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[500px]" />}>
          <PartFinderBanner />
        </Suspense>

        {/* 10. Staff Picks */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[600px]" />}>
          <StaffPicks />
        </Suspense>

        {/* 11. New Releases */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[600px]" />}>
          <NewReleases />
        </Suspense>

        {/* 12. Customer Gallery */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[400px]" />}>
          <CustomerGallery />
        </Suspense>

        {/* 13. Newsletter */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[400px]" />}>
          <NewsletterSection />
        </Suspense>

        {/* 14. SEO Content */}
        <Suspense fallback={<SectionSkeleton heightClass="h-[300px]" />}>
          <SeoAboutContent />
        </Suspense>
      </main>

      {/* 15. Footer */}
          </div>
  )
}
