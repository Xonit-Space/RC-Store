import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"

export function HeroSection() {

  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-carbon-dark">
      {/* Cinematic Garage/Track Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 cinematic-zoom"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070')" }}
        aria-hidden="true"
      />
      
      {/* Motion Blur & Red Light Streak Overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-racing-red/20 via-transparent to-transparent opacity-60 mix-blend-screen" />
      <div className="absolute top-1/4 left-0 right-0 h-32 bg-racing-red/10 blur-[100px] transform -skew-y-12" />

      {/* Gradient overlay for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-carbon-dark/80 from-0% via-carbon-dark/20 via-[40%] to-carbon-dark/95 to-100%"
        aria-hidden="true"
      />

      {/* RC Car Parallax Image (Simulated) */}
      <div className="absolute bottom-0 right-[-10%] md:right-0 w-[120%] md:w-[60%] h-[70%] z-10 pointer-events-none fade-up-section visible" style={{ transitionDelay: '0.2s' }}>
         <img 
           src="https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=2070" 
           alt="Premium RC Car" 
           className="w-full h-full object-contain object-bottom drop-shadow-[0_-20px_50px_rgba(255,30,30,0.3)] filter contrast-125"
         />
      </div>

      {/* Hero Text Content */}
      <div className="absolute inset-0 flex flex-col justify-center pt-32 pb-20 px-6 md:px-16 lg:px-24 z-20">
        <div className="max-w-4xl cinematic-enter">
          {/* Season Tag */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-racing-red animate-pulse" />
            <p className="text-[12px] font-bold tracking-[0.4em] uppercase text-racing-red">
              TRACK READY MACHINES
            </p>
          </div>

          {/* Editorial Headline */}
          <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter text-white mb-6 drop-shadow-2xl uppercase">
            Unleash<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-racing-red to-neon-red">RC Speed</span>
          </h1>

          {/* Subline */}
          <p className="text-base md:text-lg text-gray-300 max-w-lg leading-relaxed font-sans mb-10 border-l-2 border-racing-red pl-4 glass-dark p-4 rounded-r-lg">
            High-performance electric and nitro-powered machines built for ultimate dominance. Command the track with precision engineering.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link
              href="/products"
              id="hero-cta-explore"
              className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-racing-red text-white px-8 py-4 font-heading font-bold tracking-widest uppercase hover:bg-neon-red transition-all duration-300 shadow-[0_0_15px_rgba(255,30,30,0.4)] hover:shadow-[0_0_30px_rgba(255,30,30,0.8)] border border-racing-red hover:scale-105"
            >
              Explore Machines
              <ArrowRight strokeWidth={2.5} className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </Link>
            
            <Link
              href="/build"
              className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-transparent text-white px-8 py-4 font-heading font-bold tracking-widest uppercase border border-white/20 hover:border-racing-red/80 hover:bg-racing-red/10 transition-all duration-300 glass-dark hover:scale-105"
            >
              <Zap strokeWidth={2} className="w-5 h-5 text-racing-red group-hover:animate-pulse" />
              Build Your Racer
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20">
        <span className="text-[10px] font-heading font-bold tracking-[0.3em] uppercase text-white/50">System Scan</span>
        <div className="w-8 h-12 border-2 border-white/20 rounded-full relative flex justify-center p-1">
          <div className="w-1.5 h-3 bg-racing-red rounded-full animate-bounce shadow-[0_0_8px_rgba(255,30,30,0.8)]" style={{ animationDuration: "1.5s" }} />
        </div>
      </div>
    </section>
  )
}

