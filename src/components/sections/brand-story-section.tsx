import { Play } from "lucide-react"
import { db } from "@/lib/db"
import { BrandStorySlider } from "./brand-story-slider"

export async function BrandStorySection() {
  const reviews = await db.review.findMany({
    where: {
      isApproved: true,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    take: 5,
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <section className="py-24 md:py-40 bg-background overflow-hidden border-t border-border relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-center">

          {/* Left: text content & reviews */}
          <div className="md:col-span-5 space-y-12 fade-up-section visible">
            <div>
              <p className="text-[12px] font-heading font-bold tracking-[0.3em] uppercase text-primary mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-primary inline-block" />
                Pro League Verified
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-black leading-tight text-foreground dark:text-white uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(255, 204, 0,0.2)]">
                Track Tested<br />
                <span className="text-primary">Pilot Approved</span>
              </h2>
            </div>

            <div className="w-full">
              <BrandStorySlider reviews={reviews} />
            </div>
          </div>

          {/* Right: simulated video grid */}
          <div className="md:col-span-7 relative fade-up-section visible">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[4/5] bg-slate-100 dark:bg-smoke-dark overflow-hidden border border-border glass-dark relative group cursor-pointer mt-12">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-[1.35] opacity-80 filter contrast-125 saturate-50 mix-blend-luminosity group-hover:scale-[1.4] group-hover:saturate-100 transition-all duration-700"
                >
                  <source src="/snaptik_7277600208995765537_v3.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-background/30 group-hover:bg-background/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-racing-yellow/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255, 204, 0,0.6)]">
                    <Play className="w-5 h-5 text-foreground dark:text-white ml-1 fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-foreground dark:text-white tracking-widest">REC // TRACK_A</span>
                </div>
              </div>
              
              <div className="aspect-[4/5] bg-slate-100 dark:bg-smoke-dark overflow-hidden border border-border glass-dark relative group cursor-pointer">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-[1.1] opacity-80 filter contrast-125 saturate-50 mix-blend-luminosity group-hover:scale-[1.15] group-hover:saturate-100 transition-all duration-700"
                >
                  <source src="/snaptik_7531203151316258062_v3.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-background/30 group-hover:bg-background/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-racing-yellow/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255, 204, 0,0.6)]">
                    <Play className="w-5 h-5 text-foreground dark:text-white ml-1 fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-foreground dark:text-white tracking-widest">REC // BASH_SITE</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
