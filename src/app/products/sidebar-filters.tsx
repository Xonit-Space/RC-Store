"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { SlidersHorizontal, X } from "lucide-react"
import { usePrice } from "@/hooks/use-price"

interface CategoryItem {
  name: string
  slug: string
}

interface SidebarFiltersProps {
  categories: CategoryItem[]
  availableSizes?: string[]
  availableColors?: string[]
}

export function SidebarFilters({ categories, availableSizes = [], availableColors = [] }: SidebarFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { formatPrice } = usePrice()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [gender, setGender] = useState(searchParams.get("gender") || "")
  
  const initialSizes = searchParams.get("sizes") ? searchParams.get("sizes")!.split(",") : []
  const initialColors = searchParams.get("colors") ? searchParams.get("colors")!.split(",") : []
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialSizes)
  const [selectedColors, setSelectedColors] = useState<string[]>(initialColors)
  
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
      if (selectedSizes.length > 0) params.set("sizes", selectedSizes.join(","))
      if (selectedColors.length > 0) params.set("colors", selectedColors.join(","))
      if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
      if (priceRange[1] < 1500) params.set("maxPrice", priceRange[1].toString())
      
      const sort = searchParams.get("sort")
      if (sort) params.set("sort", sort)
      
      router.push(`/products?${params.toString()}`, { scroll: false })
    }, 400)
    
    return () => clearTimeout(timer)
  }, [search, category, gender, selectedSizes, selectedColors, priceRange, router, searchParams])

  const resetFilters = () => {
    setSearch("")
    setCategory("")
    setGender("")
    setSelectedSizes([])
    setSelectedColors([])
    setPriceRange([0, 1500])
  }

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])
  }

  const toggleColor = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])
  }

  const hasActiveFilters = search || category || gender || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 1500

  return (
    <div className="sticky top-28 space-y-10 max-h-[calc(100vh-120px)] overflow-y-auto pb-10 pr-4">
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
          <li>
            <button
              onClick={() => setCategory("")}
              className={`text-sm transition-colors ${!category ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              Everything
            </button>
          </li>
          {categories.map((c) => (
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

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <div className="space-y-4">
          <label className="text-[10px] tracking-[0.25em] uppercase text-foreground font-medium block">
            Size
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(size => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  selectedSizes.includes(size)
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {availableColors.length > 0 && (
        <div className="space-y-4">
          <label className="text-[10px] tracking-[0.25em] uppercase text-foreground font-medium block">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(color => (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  selectedColors.includes(color)
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <label className="text-[10px] tracking-[0.25em] uppercase text-foreground font-medium">
            Price
          </label>
          <span className="text-[10px] text-muted-foreground">
            {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
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
