"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useCallback } from "react"
import { getProducts } from "@/lib/api"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductGridSkeleton } from "@/components/ui/loading-skeleton"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, Heart, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import { useCartStore } from "@/store/cart"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useLoading } from "@/components/providers/loading-provider"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low — High" },
  { value: "price_desc", label: "Price: High — Low" },
  { value: "popular", label: "Best Sellers" },
]

const CATEGORIES = [
  { name: "Everything", slug: "" },
  { name: "Outerwear", slug: "outerwear" },
  { name: "Knitwear", slug: "knitwear" },
  { name: "Tailoring", slug: "tailoring" },
  { name: "Shirts", slug: "shirts" },
  { name: "Trousers", slug: "trousers" },
  { name: "Accessories", slug: "accessories" },
]

export default function ProductsPage() {
  const { data: session } = useSession()
  const cartStore = useCartStore()
  const { withLoading } = useLoading()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [gender, setGender] = useState("")
  const [priceRange, setPriceRange] = useState<number[]>([0, 500])
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const mapped = await getProducts({
        category: category || undefined,
        gender: (gender as any) || undefined,
        search: search || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sort,
        page,
        limit: 12,
      })
      setProducts(mapped)
      setTotalPages(mapped.length < 12 ? page : page + 1)
    } catch (err: any) {
      setError(err.message || "Failed to load catalog")
    } finally {
      setLoading(false)
    }
  }, [category, gender, search, priceRange, sort, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const resetFilters = () => {
    setSearch(""); setCategory(""); setGender("")
    setPriceRange([0, 500]); setSort("newest"); setPage(1)
  }

  const toggleWishlist = (id: string) =>
    setWishlist((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])

  const addToCart = async (product: any) => {
    const defaultVariant = product.variants?.[0]
    if (!defaultVariant) { toast.error("No variants available"); return }
    try {
      await withLoading(cartStore.addItem({
        variantId: defaultVariant.id, quantity: 1,
        product: {
          id: product.id, name: product.name, price: product.price,
          imageUrl: product.images?.[0] || "/placeholder.svg",
          size: defaultVariant.size || "M", color: defaultVariant.color || "#000000",
        },
      }, session?.user?.id))
      toast.success(`${product.name} added to bag`)
    } catch { toast.error("Could not add to bag") }
  }

  const hasActiveFilters = search || category || gender || priceRange[0] > 0 || priceRange[1] < 500

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
            <div className="sticky top-28 space-y-10">

              {/* Search */}
              <div className="space-y-4">
                <label className="text-[10px] tracking-[0.25em] uppercase text-foreground font-medium block">
                  Search
                </label>
                <div className="relative border-b border-border/60 pb-2 group focus-within:border-accent transition-colors">
                  <input
                    type="text"
                    placeholder="Type to search…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-4">
                <label className="text-[10px] tracking-[0.25em] uppercase text-foreground font-medium block">
                  Department
                </label>
                <ul className="space-y-3">
                  {["MEN", "WOMEN", "UNISEX"].map((g) => (
                    <li key={g}>
                      <button
                        onClick={() => setGender(gender === g ? "" : g)}
                        className={`text-sm transition-colors ${gender === g ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {g.charAt(0) + g.slice(1).toLowerCase()}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <label className="text-[10px] tracking-[0.25em] uppercase text-foreground font-medium block">
                  Category
                </label>
                <ul className="space-y-3">
                  {CATEGORIES.map((c) => (
                    <li key={c.slug}>
                      <button
                        onClick={() => setCategory(c.slug)}
                        className={`text-sm transition-colors ${category === c.slug ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price */}
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] tracking-[0.25em] uppercase text-foreground font-medium">
                    Price
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    Rs.{priceRange[0]} – Rs.{priceRange[1]}
                  </span>
                </div>
                <Slider
                  min={0} max={500} step={10}
                  value={priceRange}
                  onValueChange={(v) => setPriceRange(v)}
                  className="accent-brass"
                />
              </div>

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors"
                >
                  <X className="w-3 h-3" /> Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* ── PRODUCT GRID ── */}
          <div className="flex-1">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-10 md:mb-14">
              {/* Mobile filter toggle */}
              <button
                className="md:hidden flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <SlidersHorizontal strokeWidth={1} className="w-4 h-4" />
                Filters
              </button>

              <p className="hidden md:block text-xs text-muted-foreground">
                {products.length} {products.length === 1 ? "result" : "results"}
              </p>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hidden md:block">
                  Sort
                </span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none bg-transparent border-b border-border/60 text-[11px] tracking-wider text-foreground focus:outline-none focus:border-accent pr-4 pb-1 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* States */}
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : error ? (
              <div className="py-24 text-center space-y-4">
                <p className="text-sm text-muted-foreground">{error}</p>
                <button onClick={fetchProducts} className="text-[11px] tracking-[0.2em] uppercase text-accent hover:text-foreground transition-colors border-b border-accent pb-0.5">
                  Retry
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center space-y-4">
                <p className="font-serif text-2xl font-light text-foreground">Nothing found</p>
                <p className="text-sm text-muted-foreground">Try broadening your search or adjusting your filters.</p>
                <button onClick={resetFilters} className="text-[11px] tracking-[0.2em] uppercase text-accent border-b border-accent pb-0.5">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
                {products.map((product, i) => (
                  <article key={product.id} className="group">
                    {/* Image */}
                    <div className="relative overflow-hidden bg-muted mb-4 aspect-[3/4]">
                      <Link href={`/products/${product.slug}`} className="block w-full h-full">
                        <img
                          src={product.images?.[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading={i < 6 ? "eager" : "lazy"}
                        />
                      </Link>

                      {product.originalPrice && (
                        <span className="absolute top-3 left-3 text-[9px] tracking-[0.15em] uppercase text-off-white bg-terracotta px-2 py-1">
                          Sale
                        </span>
                      )}
                      {product.tags?.includes("new") && !product.originalPrice && (
                        <span className="absolute top-3 left-3 text-[9px] tracking-[0.15em] uppercase text-off-white bg-forest px-2 py-1">
                          New
                        </span>
                      )}

                      <button
                        aria-label="Wishlist"
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart strokeWidth={1} className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-terracotta text-terracotta" : "text-off-white"}`} />
                      </button>

                      <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                          onClick={() => addToCart(product)}
                          className="w-full py-3 bg-background/95 text-[10px] tracking-[0.25em] uppercase text-foreground hover:bg-forest hover:text-off-white transition-colors duration-200"
                        >
                          Add to Bag
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground">
                        {product.category?.name}
                      </p>
                      <h3 className="text-sm font-light text-foreground leading-snug">
                        <Link href={`/products/${product.slug}`} className="hover:text-accent transition-colors">
                          {product.name}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-sm text-foreground">Rs. {product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">Rs. {product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {products.length > 0 && (
              <div className="mt-20 flex items-center justify-center gap-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 group"
                >
                  <ArrowRight strokeWidth={1} className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                  Prev
                </button>
                <span className="font-serif text-lg text-muted-foreground">{page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={products.length < 12}
                  className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 group"
                >
                  Next
                  <ArrowRight strokeWidth={1} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


