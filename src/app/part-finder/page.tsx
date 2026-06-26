import { PartFinderBanner } from "@/components/sections/part-finder-banner"
import { ShieldCheck, Zap, Activity } from "lucide-react"

export const metadata = {
  title: "Part Finder | Aussie Rigs Arena",
  description: "Find the exact compatible OEM and aftermarket parts for your RC vehicle.",
}

export default function PartFinderPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <main className="flex-1 pt-24">
        {/* Page Header */}
        <div className="px-6 md:px-12 py-10 md:py-16">
          <div className="container mx-auto">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Garage & Upgrades
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-light leading-none text-foreground mb-6">
              Part Finder System
            </h1>
            <p className="max-w-2xl text-muted-foreground leading-relaxed">
              Our comprehensive database links thousands of OEM replacements and high-performance aftermarket hop-ups directly to your specific chassis. Select your vehicle below to filter out the noise.
            </p>
          </div>
        </div>

        {/* The existing banner component functions perfectly as the main interactive tool */}
        <div className="mb-20">
          <PartFinderBanner />
        </div>

        {/* Feature Highlights */}
        <div className="container mx-auto px-6 md:px-12 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="flex flex-col gap-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-heading font-bold text-foreground">Guaranteed Fitment</h3>
              <p className="text-sm text-muted-foreground">Every part listed for your model is cross-referenced with manufacturer schematics to ensure 100% compatibility.</p>
            </div>
            <div className="flex flex-col gap-4">
              <Zap className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-heading font-bold text-foreground">Performance Upgrades</h3>
              <p className="text-sm text-muted-foreground">Discover aluminum and carbon fiber hop-ups designed to push your machine past its stock limits.</p>
            </div>
          </div>
        </div>
      </main>

          </div>
  )
}
