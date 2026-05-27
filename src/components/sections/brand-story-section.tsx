import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function BrandStorySection() {
  return (
    <section className="py-24 md:py-40 bg-background overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-12 md:gap-0 items-center">

          {/* Left: large editorial image */}
          <div className="md:col-span-7 relative">
            <div className="aspect-[4/5] md:aspect-[3/4] bg-muted overflow-hidden">
              <img
                src="/placeholder.svg?height=900&width=700"
                alt="Brand Story"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Floating accent quote */}
            <div className="hidden md:block absolute -bottom-10 -right-12 bg-sand p-8 max-w-xs">
              <p className="font-serif italic text-xl text-forest leading-relaxed">
                "Crafted with intention.<br />Worn with purpose."
              </p>
            </div>
          </div>

          {/* Right: text content */}
          <div className="md:col-span-5 md:pl-20 space-y-8">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Our Story
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight text-foreground">
                A Philosophy of<br />
                <em style={{ fontStyle: "italic" }}>Timeless Making</em>
              </h2>
            </div>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm">
              Founded on the belief that true luxury is invisible — felt in the weight of a fabric, 
              the precision of a seam, the quiet confidence it gives the wearer. We source only from 
              artisan mills with decades of craft heritage.
            </p>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm">
              Every piece is designed to outlast trends, seasons, and decades. We make fewer things, 
              but we make them exceptionally well.
            </p>

            <Link
              href="/about"
              className="inline-flex items-center gap-3 text-[11px] tracking-[0.25em] uppercase text-foreground border-b border-border pb-1 hover:border-brass hover:text-brass transition-all duration-300 group"
            >
              Read Our Story
              <ArrowRight strokeWidth={1} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
