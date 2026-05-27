"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useEffect, useRef } from "react"

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked by the browser; that is acceptable
      })
    }
  }, [])

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden bg-charcoal">
      {/* Cinematic Video Background */}
      <video
        ref={videoRef}
        src="/hero-product.mov"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        aria-hidden="true"
      />

      {/* Gradient overlay — top and bottom fade for editorial legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(28,28,26,0.35) 0%, rgba(28,28,26,0) 40%, rgba(28,28,26,0) 60%, rgba(28,28,26,0.65) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Editorial Text Content */}
      <div className="absolute inset-0 flex flex-col justify-end pb-20 md:pb-28 px-6 md:px-16 lg:px-24">
        <div className="max-w-4xl">
          {/* Season Tag */}
          <p className="text-[10px] font-medium tracking-[0.35em] uppercase text-sand mb-6 md:mb-8">
            Summer Collection — 2025
          </p>

          {/* Editorial Headline */}
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light leading-[0.9] tracking-tight text-off-white mb-8 md:mb-12">
            Quiet<br />
            <em className="not-italic" style={{ fontStyle: "italic" }}>Luxury.</em>
          </h1>

          {/* Subline + CTA row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
            <p className="text-sm md:text-base text-sand/80 max-w-sm leading-relaxed font-light">
              Timeless silhouettes crafted from the world's finest materials.
              Designed to be worn — and remembered.
            </p>

            <div className="flex items-center gap-8">
              <Link
                href="/products"
                id="hero-cta-explore"
                className="group flex items-center gap-3 text-[11px] font-medium tracking-[0.25em] uppercase text-off-white border-b border-off-white/40 pb-1 hover:border-brass hover:text-brass transition-all duration-300"
              >
                Explore Collection
                <ArrowRight strokeWidth={1} className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 md:right-16 flex flex-col items-center gap-2 opacity-50">
        <span className="text-[9px] tracking-[0.3em] uppercase text-off-white rotate-90 origin-center mb-4">Scroll</span>
        <div className="w-px h-12 bg-off-white/50 relative overflow-hidden">
          <div
            className="absolute top-0 w-full h-1/2 bg-off-white animate-bounce"
            style={{ animationDuration: "2s" }}
          />
        </div>
      </div>
    </section>
  )
}

