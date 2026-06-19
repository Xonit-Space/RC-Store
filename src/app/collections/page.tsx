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
    { id: "1", name: "Core Essentials", slug: "core-essentials", description: "The foundational pieces of the modern wardrobe.", image: "/placeholder.svg", _count: { products: 12 } },
    { id: "2", name: "Autumn/Winter '26", slug: "aw-26", description: "Heavyweight fabrics and structured outerwear.", image: "/placeholder.svg", _count: { products: 24 } },
    { id: "3", name: "The Silk Capsule", slug: "silk-capsule", description: "Fluid silhouettes in premium washed silk.", image: "/placeholder.svg", _count: { products: 8 } },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto w-full">
        
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Curated Edits</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground">Collections</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
          {displayCollections.map((collection, index) => (
            <Link 
              key={collection.id} 
              href={`/products?collection=${collection.slug}`}
              className={`group flex flex-col ${index % 2 !== 0 ? 'md:mt-24' : ''}`}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/20 mb-6">
                <Image
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  fill
                  className="object-cover object-center grayscale opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-out"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <h2 className="font-serif text-2xl font-light text-foreground">{collection.name}</h2>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                    {collection._count.products} Items
                  </span>
                </div>
                {collection.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
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
