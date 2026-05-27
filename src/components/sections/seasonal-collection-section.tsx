import Link from "next/link"
import { ArrowRight } from "lucide-react"

const collections = [
  {
    id: 1,
    title: "The Linen Edit",
    season: "Summer 2026",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80",
    href: "/products?collection=linen-edit",
  },
  {
    id: 2,
    title: "Terrain",
    season: "Summer 2026",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
    href: "/products?collection=terrain",
  },
  {
    id: 3,
    title: "Nocturne",
    season: "Summer 2026",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
    href: "/products?collection=nocturne",
  },
]

export function SeasonalCollectionSection() {
  return (
    <section className="py-24 md:py-40 bg-sand/20">
      <div className="container mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="flex items-end justify-between mb-16 md:mb-24">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Summer 2026
            </p>
            <h2 className="font-serif text-4xl md:text-6xl font-light leading-none tracking-tight text-foreground">
              Collections
            </h2>
          </div>
          <Link
            href="/collections"
            className="hidden md:flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors group"
          >
            All Collections
            <ArrowRight strokeWidth={1} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Collections grid — asymmetric with large first tile */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

          {/* Large featured collection */}
          <Link href={collections[0].href} className="md:col-span-7 group relative overflow-hidden block aspect-[3/4] md:aspect-auto md:h-[680px]">
            <img
              src={collections[0].image}
              alt={collections[0].title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8">
              <p className="text-[9px] tracking-[0.3em] uppercase text-sand/70 mb-2">{collections[0].season}</p>
              <h3 className="font-serif text-3xl md:text-4xl font-light text-off-white">{collections[0].title}</h3>
            </div>
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowRight strokeWidth={1} className="w-6 h-6 text-off-white" />
            </div>
          </Link>

          {/* Two smaller collections stacked */}
          <div className="md:col-span-5 flex flex-col gap-4 md:gap-6">
            {collections.slice(1).map((col) => (
              <Link key={col.id} href={col.href} className="group relative overflow-hidden block aspect-[4/3] md:flex-1 md:aspect-auto">
                <img
                  src={col.image}
                  alt={col.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-sand/70 mb-1">{col.season}</p>
                  <h3 className="font-serif text-xl md:text-2xl font-light text-off-white">{col.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
