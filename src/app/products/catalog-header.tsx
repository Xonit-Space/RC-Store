"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SidebarFilters } from "./sidebar-filters"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low — High" },
  { value: "price_desc", label: "Price: High — Low" },
  { value: "popular", label: "Best Sellers" },
]

interface CatalogHeaderProps {
  totalCount: number;
}

export function CatalogHeader({ totalCount }: CatalogHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "newest"

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", e.target.value)
    router.push(`/products?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center justify-between mb-10 md:mb-14">
      {/* Mobile filter toggle */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="md:hidden flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            <SlidersHorizontal strokeWidth={1} className="w-4 h-4" />
            Filters
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto pt-12">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-left font-serif font-light text-2xl">Filters</SheetTitle>
          </SheetHeader>
          <SidebarFilters />
        </SheetContent>
      </Sheet>

      <p className="hidden md:block text-xs text-muted-foreground">
        {totalCount} {totalCount === 1 ? "result" : "results"}
      </p>

      {/* Sort */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hidden md:block">
          Sort
        </span>
        <div className="relative">
          <select
            value={currentSort}
            onChange={handleSortChange}
            className="appearance-none bg-transparent border-b border-border/60 text-[11px] tracking-wider text-foreground focus:outline-none focus:border-accent pr-4 pb-1 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
