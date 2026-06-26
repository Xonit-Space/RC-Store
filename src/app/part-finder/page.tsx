import { PartFinderBanner } from "@/components/sections/part-finder-banner"
import { ShieldCheck, Zap, PackageSearch } from "lucide-react"
import { db } from "@/lib/db"
import { ProductCard } from "@/components/product/product-card"
import { serializeForClient } from "@/lib/serialize"

export const metadata = {
  title: "Part Finder | Aussie Rigs Arena",
  description: "Find the exact compatible OEM and aftermarket parts for your RC vehicle.",
}

async function getPartsForModel(modelId: string) {
  const model = await db.vehicleModel.findUnique({
    where: { id: modelId },
    include: { make: true }
  })
  if (!model) return { model: null, parts: [] }

  const compatibilities = await db.partCompatibility.findMany({
    where: { vehicleModelId: modelId },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: true,
          reviews: { select: { rating: true } },
        }
      }
    }
  })

  return { model, parts: serializeForClient(compatibilities.map(c => c.product)) }
}

export default async function PartFinderPage({
  searchParams
}: {
  searchParams: { make?: string; model?: string }
}) {
  const { modelId, parts, model } = searchParams.model ? await getPartsForModel(searchParams.model).then(res => ({ modelId: searchParams.model, ...res })) : { modelId: null, parts: [], model: null }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pt-24">
        {/* Page Header */}
        <div className="px-6 md:px-12 py-10 md:py-16">
          <div className="container mx-auto">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Garage & Upgrades
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-light leading-none text-foreground mb-6">
              Part Finder System
            </h1>
            <p className="max-w-2xl text-muted-foreground leading-relaxed">
              Our comprehensive database links thousands of OEM replacements and high-performance aftermarket hop-ups directly to your specific chassis. Select your vehicle below to filter out the noise.
            </p>
          </div>
        </div>

        {/* The banner acts as the search form */}
        <div className="mb-12">
          <PartFinderBanner />
        </div>

        {/* Results Section */}
        {modelId && (
          <div className="container mx-auto px-6 md:px-12 pb-24">
            <div className="border-t border-border/40 pt-12">
              {model ? (
                <div className="mb-10">
                  <h2 className="text-2xl font-serif text-foreground mb-2">
                    Compatible Parts for <span className="font-bold text-primary">{model.make.name} {model.name}</span> {model.scale ? `(${model.scale})` : ''}
                  </h2>
                  <p className="text-sm text-muted-foreground">{parts.length} part{parts.length !== 1 ? 's' : ''} found</p>
                </div>
              ) : (
                <div className="mb-10">
                  <h2 className="text-2xl font-serif text-foreground mb-2 text-terracotta">Vehicle not found</h2>
                  <p className="text-sm text-muted-foreground">The selected vehicle model could not be found in our database.</p>
                </div>
              )}

              {parts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {parts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : model ? (
                <div className="py-20 text-center border border-dashed border-border/40 bg-muted/5 flex flex-col items-center justify-center">
                  <PackageSearch className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-serif text-foreground mb-2">No parts linked yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We haven&apos;t verified any compatible parts for the {model.make.name} {model.name} yet. Check back soon!
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Feature Highlights (Show if no search performed) */}
        {!modelId && (
          <div className="container mx-auto px-6 md:px-12 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              <div className="flex flex-col gap-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-heading font-bold text-foreground">Guaranteed Fitment</h3>
                <p className="text-sm text-muted-foreground">Every part listed for your model is cross-referenced with manufacturer schematics to ensure 100% compatibility.</p>
              </div>
              <div className="flex flex-col gap-4">
                <Zap className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-heading font-bold text-foreground">Performance Upgrades</h3>
                <p className="text-sm text-muted-foreground">Discover aluminum and carbon fiber hop-ups designed to push your machine past its stock limits.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
