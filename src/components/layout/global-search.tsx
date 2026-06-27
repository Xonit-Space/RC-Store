"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { searchProducts } from "@/actions/product"
import { usePrice } from "@/hooks/use-price"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { formatPrice } = usePrice()
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const data = await searchProducts(query)
      setResults(data)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleOpen = () => {
    setIsOpen(true)
    setTimeout(() => {
      document.getElementById("global-search-input")?.focus()
    }, 100)
  }

  const handleClose = () => {
    setIsOpen(false)
    setQuery("")
    setResults([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim().length > 0) {
      handleClose()
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
    } else if (e.key === "Escape") {
      handleClose()
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={handleOpen}
        className="p-2 text-foreground hover:bg-muted rounded-full transition-colors flex items-center justify-center border border-transparent hover:border-border"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-screen max-w-sm sm:max-w-md bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center border-b border-border p-2">
            <Search className="h-4 w-4 ml-2 text-muted-foreground" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            />
            {query.length > 0 && (
              <button onClick={() => setQuery("")} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isSearching && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            
            {!isSearching && query.length >= 2 && results.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No products found matching &quot;{query}&quot;
              </div>
            )}

            {!isSearching && results.length > 0 && (
              <div className="p-2 flex flex-col gap-1">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={handleClose}
                    className="flex items-center gap-3 p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <div className="w-12 h-12 shrink-0 bg-background rounded overflow-hidden flex items-center justify-center border border-border/50">
                      <img src={product.imageUrl || "/placeholder.svg"} alt={product.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{product.category?.name}</p>
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {formatPrice(product.price)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {query.length > 0 && (
              <div className="border-t border-border p-2">
                <Link
                  href={`/products?search=${encodeURIComponent(query)}`}
                  onClick={handleClose}
                  className="block w-full text-center py-2 text-xs font-bold text-primary hover:bg-muted rounded-md transition-colors"
                >
                  View all results for &quot;{query}&quot;
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
