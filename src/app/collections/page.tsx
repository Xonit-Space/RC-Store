import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { db } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"

// ISR: collections change rarely, cache for 1 hour
export const revalidate = 3600

export default async function CollectionsPage() {
  const collections = await db.collection.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      _count: {
        select: { products: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Fallback if no collections exist in DB
  const displayCollections = collections.length > 0 ? collections : [
    { id: "1", name: "Drift Control Series", slug: "drift", description: "Precision-engineered machines built to slide and dominate the tightest corners.", image: "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?w=800&q=80", _count: { products: 12 } },
    { id: "2", name: "Off-Road Bashers", slug: "off-road", description: "Heavy-duty chassis and massive suspension travel for ultimate terrain conquering.", image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80", _count: { products: 24 } },
    { id: "3", name: "Track Speedsters", slug: "speed", description: "Aerodynamic shells and high RPM brushless motors for extreme straight-line velocity.", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80", _count: { products: 8 } },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto w-full relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        
        <div className="mb-16 relative z-10 fade-up-section visible">
          <p className="text-[10px] font-heading tracking-[0.3em] uppercase text-racing-yellow mb-4 flex items-center gap-2">
            <span className="w-4 h-px bg-racing-yellow inline-block" />
            Machine Classification
          </p>
          <h1 className="font-heading text-4xl md:text-6xl font-black text-foreground dark:text-white uppercase drop-shadow-[0_0_15px_rgba(255, 204, 0,0.3)]">Racing Ecosystem</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 relative z-10">
          {displayCollections.map((collection, index) => (
            <Link 
              key={collection.id} 
              href={`/products?collection=${collection.slug}`}
              className={`group flex flex-col ${index % 2 !== 0 ? 'md:mt-24' : ''} fade-up-section visible`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-smoke-dark mb-6 border border-border group-hover:border-racing-yellow transition-colors duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(255, 204, 0,0.2)]">
                <Image
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  fill
                  className="object-cover object-center filter contrast-125 saturate-50 group-hover:saturate-100 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon-dark/80 to-transparent pointer-events-none" />
              </div>
              <div className="space-y-3 glass-dark p-6 border-l-2 border-transparent group-hover:border-racing-yellow transition-all">
                <div className="flex justify-between items-baseline">
                  <h2 className="font-heading text-2xl font-black text-foreground dark:text-white uppercase tracking-tight group-hover:text-racing-yellow transition-colors">{collection.name}</h2>
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-gray-500">
                    {collection._count.products} MACHINES
                  </span>
                </div>
                {collection.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 max-w-md font-sans">
                    {collection.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

      </main>
      <Footer />
    </div>
  )
}
