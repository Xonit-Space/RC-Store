import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { db } from "@/lib/db"

export async function ShopCategories() {
  const dbCategories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    take: 6
  })

  // Provide fallback image if category has no image uploaded yet
  const fallbackImages = [
    "https://images.unsplash.com/photo-1589793463357-550912af4a4c?q=80&w=1000",
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1000",
    "https://images.unsplash.com/photo-1622345095360-14e38c92a688?q=80&w=1000",
    "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?q=80&w=1000",
    "https://images.unsplash.com/photo-1601524909162-ae8725290836?q=80&w=1000",
    "https://images.unsplash.com/photo-1614083311899-7988591dff32?q=80&w=1000",
  ]

  const categories = dbCategories.map((c, i) => {
    let colSpan = "col-span-1"
    if (i === 0) colSpan = "col-span-1 md:col-span-2 row-span-2"
    else if (i === 3) colSpan = "col-span-1 md:col-span-2"

    return {
      name: c.name,
      slug: c.slug,
      image: c.image || fallbackImages[i % fallbackImages.length],
      colSpan
    }
  })

  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Shop By Department</p>
            </div>
            <h2 className="font-heading font-black text-4xl text-foreground uppercase tracking-wider">
              Explore Categories
            </h2>
          </div>
          <Link href="/categories" className="hidden md:flex text-sm font-mono font-bold tracking-widest text-muted-foreground hover:text-primary uppercase transition-colors">
            View All Categories
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto gap-4 md:h-[600px]">
          {categories.map((cat, idx) => (
            <Link 
              href={`/products?category=${cat.slug}`} 
              key={idx}
              className={`relative group overflow-hidden ${cat.colSpan} bg-muted block min-h-[200px] border border-border hover:border-racing-yellow/50 transition-colors`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 opacity-90" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
              />
              <div className="absolute bottom-0 left-0 p-6 z-20 w-full flex justify-between items-end">
                <h3 className="font-heading font-bold text-2xl text-white uppercase tracking-widest group-hover:text-racing-yellow transition-colors">
                  {cat.name}
                </h3>
                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-carbon-dark/50 group-hover:bg-racing-yellow group-hover:border-racing-yellow group-hover:text-carbon-dark transition-all">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
