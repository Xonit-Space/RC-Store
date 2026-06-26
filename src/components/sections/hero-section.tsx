import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"

export function HeroSection() {

  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-background">
      {/* Cinematic Garage/Track Background (Video) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60 dark:mix-blend-luminosity scale-105 cinematic-zoom"
        poster="https://images.unsplash.com/photo-1596484552993-80a56f08fb76?q=80&w=2070"
      >
        {/* Explicit RC Car Racing Video */}
        <source src="/snaptik_7610286081623297294_v3.mp4" type="video/mp4" />
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596484552993-80a56f08fb76?q=80&w=2070')" }}
        />
      </video>
      
      {/* Motion Blur & Red Light Streak Overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-racing-yellow/20 via-transparent to-transparent opacity-60 mix-blend-screen" />
      <div className="absolute top-1/4 left-0 right-0 h-32 bg-racing-yellow/10 blur-[100px] transform -skew-y-12" />



      {/* Hero Text Content */}
      <div className="absolute inset-0 flex flex-col justify-center pt-32 pb-20 px-6 md:px-16 lg:px-24 z-20">
        <div className="max-w-4xl cinematic-enter">
          {/* Season Tag */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[12px] font-bold tracking-[0.4em] uppercase text-primary">
              MASSIVE CLEARANCE EVENT
            </p>
          </div>

          {/* Editorial Headline */}
          <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter text-foreground dark:text-white mb-6 drop-shadow-xl dark:drop-shadow-2xl uppercase">
            EOFY<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-racing-yellow to-neon-yellow">SALE 2026</span>
          </h1>

          {/* Subline */}
          <p className="text-base md:text-lg text-muted-foreground dark:text-gray-300 max-w-lg leading-relaxed font-sans mb-10 border-l-2 border-primary pl-4">
            Up to 40% off on all high-performance electric and nitro-powered machines, parts, and accessories. Gear up for ultimate dominance.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link
              href="/products?sale=true"
              id="hero-cta-explore"
              className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 font-heading font-black tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 shadow-[0_0_15px_rgba(255, 204, 0,0.4)] hover:shadow-[0_0_30px_rgba(255, 204, 0,0.8)] border border-primary hover:scale-105"
            >
              Shop Now
              <ArrowRight strokeWidth={2.5} className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </Link>
            
            <Link
              href="/collections/new-arrivals"
              className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-transparent text-foreground dark:text-white px-8 py-4 font-heading font-bold tracking-widest uppercase border border-border hover:border-racing-yellow/80 hover:bg-racing-yellow/10 transition-all duration-300 glass-dark hover:scale-105"
            >
              <Zap strokeWidth={2} className="w-5 h-5 text-primary group-hover:animate-pulse" />
              View New Arrivals
            </Link>
          </div>
        </div>
      </div>


    </section>
  )
}

