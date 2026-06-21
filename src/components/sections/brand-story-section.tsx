import Link from "next/link"
import { ArrowRight, Wrench } from "lucide-react"

export function BrandStorySection() {
  return (
    <section className="py-24 md:py-40 bg-carbon-dark overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-12 md:gap-0 items-center">

          {/* Left: large engineering image */}
          <div className="md:col-span-7 relative fade-up-section visible">
            <div className="aspect-[4/5] md:aspect-[3/4] bg-smoke-dark overflow-hidden border border-white/10 glass-dark">
              <img
                src="https://images.unsplash.com/photo-1518903332039-44415cf2338f?w=800&q=80"
                alt="Engineering Lab"
                className="w-full h-full object-cover opacity-80 filter contrast-125 saturate-50 mix-blend-luminosity"
                loading="lazy"
              />
            </div>
            {/* Floating accent spec */}
            <div className="hidden md:flex absolute -bottom-10 -right-12 bg-racing-red p-8 max-w-xs flex-col shadow-[0_0_30px_rgba(255,30,30,0.4)] animate-pulse" style={{ animationDuration: "4s" }}>
              <p className="font-heading font-black uppercase text-xl text-white leading-relaxed">
                "Engineered for dominance.<br />Built for the track."
              </p>
              <div className="mt-4 flex items-center gap-2 text-white/80">
                <Wrench className="w-4 h-4" />
                <span className="text-[10px] tracking-widest font-mono">LAB_04 // SPEC_R</span>
              </div>
            </div>
          </div>

          {/* Right: text content */}
          <div className="md:col-span-5 md:pl-20 space-y-8 fade-up-section visible">
            <div>
              <p className="text-[12px] font-heading font-bold tracking-[0.3em] uppercase text-racing-red mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-racing-red inline-block" />
                Our Engineering
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-black leading-tight text-white uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(255,30,30,0.2)]">
                A Philosophy of<br />
                <span className="text-racing-red">Peak Performance</span>
              </h2>
            </div>

            <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-sm font-sans">
              Founded on the belief that true speed is invisible — felt in the grip of the tires, 
              the precision of the steering servo, the raw power of the brushless motor. We source only from 
              top-tier manufacturing labs with decades of racing heritage.
            </p>

            <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-sm font-sans">
              Every machine is designed to outlast the competition. We build fewer models, 
              but we engineer them exceptionally well.
            </p>

            <Link
              href="/about"
              className="inline-flex items-center gap-3 text-[12px] font-heading font-bold tracking-[0.25em] uppercase text-white border-b border-white/20 pb-2 hover:border-racing-red hover:text-racing-red transition-all duration-300 group mt-4"
            >
              Access Engineering Logs
              <ArrowRight strokeWidth={2} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
