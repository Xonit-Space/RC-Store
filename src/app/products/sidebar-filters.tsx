"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { SlidersHorizontal, X } from "lucide-react"

const CATEGORIES = [
  { name: "Everything", slug: "" },
  { name: "Electric Cars", slug: "electric" },
  { name: "Nitro Cars", slug: "nitro" },
  { name: "Crawlers", slug: "crawlers" },
  { name: "Drift", slug: "drift" },
  { name: "Transmitters", slug: "transmitters" },
  { name: "Batteries", slug: "batteries" },
  { name: "Suspension", slug: "suspension" },
]

export function SidebarFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [gender, setGender] = useState(searchParams.get("gender") || "")
  const [priceRange, setPriceRange] = useState<number[]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 1500
  ])
  
  // Debounce updates to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (category) params.set("category", category)
      if (gender) params.set("gender", gender)
      if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
      if (priceRange[1] < 1500) params.set("maxPrice", priceRange[1].toString())
      
      const sort = searchParams.get("sort")
      if (sort) params.set("sort", sort)
      
      router.push(`/products?${params.toString()}`, { scroll: false })
    }, 400)
    
    return () => clearTimeout(timer)
  }, [search, category, gender, priceRange, router, searchParams])

  const resetFilters = () => {
    setSearch("")
    setCategory("")
    setGender("")
    setPriceRange([0, 1500])
  }

  const hasActiveFilters = search || category || gender || priceRange[0] > 0 || priceRange[1] < 1500

  return (
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
          min={0} max={1500} step={50}
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
  )
}
