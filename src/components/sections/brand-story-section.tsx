import Link from "next/link"
import { ArrowRight, Play, Star } from "lucide-react"

const reviews = [
  {
    id: 1,
    user: "Alex_Drift_99",
    rating: 5,
    comment: "Absolutely incredible control. The telemetry data is a game changer for track tuning.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&q=80"
  },
  {
    id: 2,
    user: "TrackMaster_X",
    rating: 5,
    comment: "Hit 110km/h on my first straight. The carbon chassis didn't even flinch when launched.",
    image: "https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?w=400&q=80"
  }
]

export function BrandStorySection() {
  return (
    <section className="py-24 md:py-40 bg-background overflow-hidden border-t border-border relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-center">

          {/* Left: text content & reviews */}
          <div className="md:col-span-5 space-y-12 fade-up-section visible">
            <div>
              <p className="text-[12px] font-heading font-bold tracking-[0.3em] uppercase text-racing-red mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-racing-red inline-block" />
                Pro League Verified
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-black leading-tight text-foreground dark:text-white uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(255,30,30,0.2)]">
                Track Tested<br />
                <span className="text-racing-red">Pilot Approved</span>
              </h2>
            </div>

            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="glass-dark p-6 border border-border hover:border-racing-red/40 transition-colors">
                  <div className="flex gap-1 mb-3 text-racing-red">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-4">"{review.comment}"</p>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">PILOT // {review.user}</p>
                </div>
              ))}
            </div>

            <Link
              href="/community"
              className="inline-flex items-center gap-3 text-[12px] font-heading font-bold tracking-[0.25em] uppercase text-foreground dark:text-white border-b border-border pb-2 hover:border-racing-red hover:text-racing-red transition-all duration-300 group mt-4"
            >
              Access Community Logs
              <ArrowRight strokeWidth={2} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
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
                  className="w-full h-full object-cover opacity-80 filter contrast-125 saturate-50 mix-blend-luminosity group-hover:scale-105 group-hover:saturate-100 transition-all duration-700"
                >
                  <source src="/snaptik_7277600208995765537_v3.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-background/30 group-hover:bg-background/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-racing-red/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,30,30,0.6)]">
                    <Play className="w-5 h-5 text-foreground dark:text-white ml-1 fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-foreground dark:text-white tracking-widest">REC // TRACK_A</span>
                </div>
              </div>
              
              <div className="aspect-[4/5] bg-slate-100 dark:bg-smoke-dark overflow-hidden border border-border glass-dark relative group cursor-pointer">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-80 filter contrast-125 saturate-50 mix-blend-luminosity group-hover:scale-105 group-hover:saturate-100 transition-all duration-700"
                >
                  <source src="/snaptik_7531203151316258062_v3.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-background/30 group-hover:bg-background/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-racing-red/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,30,30,0.6)]">
                    <Play className="w-5 h-5 text-foreground dark:text-white ml-1 fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
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
