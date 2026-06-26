import Link from "next/link"
import { ArrowRight, Crosshair } from "lucide-react"

const collections = [
  {
    id: 1,
    title: "Off-Road RC Trucks",
    season: "All-Terrain Series",
    image: "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800&q=80",
    href: "/products?collection=off-road",
  },
  {
    id: 2,
    title: "Drift RC Cars",
    season: "Precision Control",
    image: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=80",
    href: "/products?collection=drift",
  },
  {
    id: 3,
    title: "Speed Racing Cars",
    season: "Track Dominance",
    image: "https://images.unsplash.com/photo-1611821064430-0d40221e4c98?w=800&q=80",
    href: "/products?collection=speed",
  },
]

export function SeasonalCollectionSection() {
  return (
    <section className="py-24 md:py-40 bg-background relative border-t border-border">
      <div className="container mx-auto px-6 md:px-12 relative z-10">

        {/* Header */}
        <div className="flex items-end justify-between mb-16 md:mb-24 fade-up-section visible">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Crosshair className="w-4 h-4 text-primary animate-pulse" />
              <p className="text-[12px] font-heading font-bold tracking-[0.3em] uppercase text-primary">
                Racing Ecosystem
              </p>
            </div>
            <h2 className="font-heading text-4xl md:text-6xl font-black leading-none tracking-tighter text-foreground dark:text-white uppercase drop-shadow-[0_0_15px_rgba(255, 204, 0,0.3)]">
              RC Categories
            </h2>
          </div>
          <Link
            href="/collections"
            className="hidden md:flex items-center gap-2 text-[12px] font-heading font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-primary hover:drop-shadow-[0_0_8px_rgba(255, 204, 0,0.8)] transition-all group"
          >
            All Categories
            <ArrowRight strokeWidth={2} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Collections grid — asymmetric with large first tile */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

          {/* Large featured collection */}
          <Link href={collections[0].href} className="md:col-span-7 group relative overflow-hidden block aspect-[3/4] md:aspect-auto md:h-[680px] border border-border hover:border-primary hover:shadow-[0_0_30px_rgba(255, 204, 0,0.3)] transition-all duration-500 fade-up-section visible">
            <img
              src={collections[0].image}
              alt={collections[0].title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter contrast-125 saturate-50 group-hover:saturate-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-carbon-dark via-carbon-dark/40 to-transparent" />
            <div className="absolute bottom-8 left-8 z-10">
              <p className="text-[10px] font-heading tracking-[0.4em] uppercase text-primary mb-2">{collections[0].season}</p>
              <h3 className="font-heading text-3xl md:text-5xl font-black text-foreground dark:text-white uppercase tracking-tighter">{collections[0].title}</h3>
            </div>
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <div className="bg-primary p-3 flex items-center justify-center">
                <ArrowRight strokeWidth={2} className="w-6 h-6 text-foreground dark:text-white" />
              </div>
            </div>
          </Link>

          {/* Two smaller collections stacked */}
          <div className="md:col-span-5 flex flex-col gap-6 md:gap-8">
            {collections.slice(1).map((col, i) => (
              <Link key={col.id} href={col.href} className="group relative overflow-hidden block aspect-[4/3] md:flex-1 md:aspect-auto border border-border hover:border-primary hover:shadow-[0_0_30px_rgba(255, 204, 0,0.3)] transition-all duration-500 fade-up-section visible" style={{ transitionDelay: `${(i+1)*0.2}s` }}>
                <img
                  src={col.image}
                  alt={col.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter contrast-125 saturate-50 group-hover:saturate-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon-dark via-carbon-dark/40 to-transparent" />
                <div className="absolute bottom-6 left-6 z-10">
                  <p className="text-[9px] font-heading tracking-[0.3em] uppercase text-primary mb-1">{col.season}</p>
                  <h3 className="font-heading text-xl md:text-3xl font-black text-foreground dark:text-white uppercase tracking-tighter">{col.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
