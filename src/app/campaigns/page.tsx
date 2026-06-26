import Image from "next/image"
import Link from "next/link"

export default function CampaignsPage() {
  const campaigns = [
    {
      title: "The Carbon Dominance",
      season: "LEAGUE // 26",
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2070&auto=format&fit=crop",
      description: "An exploration of structured carbon forms and high-RPM velocity designed to protect, endure, and win."
    },
    {
      title: "Night Drift Championship",
      season: "TOKYO // 26",
      image: "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=2071&auto=format&fit=crop",
      description: "Fluidity in motion. A capsule of precision-engineered RC machines for the ultimate midnight track experience."
    }
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
            <main className="flex-1 pt-32 pb-24 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        
        <div className="px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto w-full mb-16 relative z-10 fade-up-section visible">
          <p className="text-[10px] font-heading tracking-[0.3em] uppercase text-racing-yellow mb-4 flex items-center gap-2">
            <span className="w-4 h-px bg-racing-yellow inline-block" />
            Elite Access
          </p>
          <h1 className="font-heading text-4xl md:text-6xl font-black text-foreground dark:text-white uppercase drop-shadow-[0_0_15px_rgba(255, 204, 0,0.3)]">Pro Racing League</h1>
        </div>

        <div className="space-y-32 relative z-10">
          {campaigns.map((campaign, index) => (
            <section key={index} className="w-full fade-up-section visible" style={{ transitionDelay: `${index * 0.2}s` }}>
              <div className="px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
                <div className={`md:col-span-7 ${index % 2 !== 0 ? 'md:order-2' : ''} group`}>
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-smoke-dark border border-border group-hover:border-racing-yellow transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(255, 204, 0,0.3)]">
                    <Image
                      src={campaign.image}
                      alt={campaign.title}
                      fill
                      className="object-cover object-center filter contrast-125 saturate-50 group-hover:saturate-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon-dark/80 to-transparent pointer-events-none" />
                  </div>
                </div>
                <div className={`md:col-span-5 space-y-6 ${index % 2 !== 0 ? 'md:order-1' : ''} glass-dark p-8 border-l-2 border-transparent hover:border-racing-yellow transition-colors`}>
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-racing-yellow font-bold">
                    {campaign.season}
                  </p>
                  <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-black text-foreground dark:text-white uppercase leading-tight tracking-tight">
                    {campaign.title}
                  </h2>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                    {campaign.description}
                  </p>
                  <div className="pt-8">
                    <Link href="/products" className="inline-block text-[12px] font-heading tracking-[0.2em] uppercase font-bold border-b border-border text-foreground dark:text-white hover:text-racing-yellow hover:border-racing-yellow transition-colors pb-1">
                      Shop Collection
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
          </div>
  )
}
