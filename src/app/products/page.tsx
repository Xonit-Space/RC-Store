import { getProductsServer as getProducts } from "@/lib/server-api"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SidebarFilters } from "./sidebar-filters"
import { CatalogHeader } from "./catalog-header"
import { ProductCard } from "@/components/product/product-card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

// ISR: revalidate catalog every 60 seconds
export const revalidate = 60

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = searchParams

  const category = typeof params.category === "string" ? params.category : undefined
  const gender = typeof params.gender === "string" ? params.gender : undefined
  const search = typeof params.search === "string" ? params.search : undefined
  const sort = typeof params.sort === "string" ? params.sort : "newest"
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : 0
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : 500
  const page = typeof params.page === "string" ? Number(params.page) : 1

  const products = await getProducts({
    category,
    gender: gender as any,
    search,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: 12,
  })

  // Basic pagination logic for next/prev
  const currentParams = new URLSearchParams()
  if (search) currentParams.set("search", search)
  if (category) currentParams.set("category", category)
  if (gender) currentParams.set("gender", gender)
  if (minPrice > 0) currentParams.set("minPrice", minPrice.toString())
  if (maxPrice < 500) currentParams.set("maxPrice", maxPrice.toString())
  if (sort) currentParams.set("sort", sort)

  const prevParams = new URLSearchParams(currentParams.toString())
  prevParams.set("page", Math.max(1, page - 1).toString())

  const nextParams = new URLSearchParams(currentParams.toString())
  nextParams.set("page", (page + 1).toString())

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Page Title Bar */}
      <div className="pt-24 pb-10 md:pt-32 md:pb-12 px-6 md:px-12 border-b border-border/40">
        <div className="container mx-auto flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
              The Catalog
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-light leading-none text-foreground">
              All Products
            </h1>
          </div>
          <p className="hidden md:block text-sm text-muted-foreground pb-1">
            {products.length} items
          </p>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-6 md:px-12 py-10 md:py-16">
        <div className="flex gap-12 md:gap-16 lg:gap-20">

          {/* ── SIDEBAR FILTERS ── */}
          <aside className="w-52 shrink-0 hidden md:block">
            <SidebarFilters />
          </aside>

          {/* ── PRODUCT GRID ── */}
          <div className="flex-1">
            <CatalogHeader totalCount={products.length} />

            {products.length === 0 ? (
              <div className="py-24 text-center space-y-4">
                <p className="font-serif text-2xl font-light text-foreground">Nothing found</p>
                <p className="text-sm text-muted-foreground">Try broadening your search or adjusting your filters.</p>
                <Link href="/products" className="text-[11px] tracking-[0.2em] uppercase text-accent border-b border-accent pb-0.5">
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 6} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {products.length > 0 && (
              <div className="mt-20 flex items-center justify-center gap-12">
                <Link
                  href={`/products?${prevParams.toString()}`}
                  className={`text-[11px] tracking-[0.2em] uppercase transition-colors flex items-center gap-2 group ${
                    page === 1 ? "text-muted-foreground/30 pointer-events-none" : "text-muted-foreground hover:text-accent"
                  }`}
                >
                  <ArrowRight strokeWidth={1} className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                  Prev
                </Link>
                
                <span className="font-serif text-lg text-muted-foreground">{page}</span>
                
                <Link
                  href={`/products?${nextParams.toString()}`}
                  className={`text-[11px] tracking-[0.2em] uppercase transition-colors flex items-center gap-2 group ${
                    products.length < 12 ? "text-muted-foreground/30 pointer-events-none" : "text-muted-foreground hover:text-accent"
                  }`}
                >
                  Next
                  <ArrowRight strokeWidth={1} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
