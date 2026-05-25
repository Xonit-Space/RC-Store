"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Mic, Camera, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useLoading } from "@/components/providers/loading-provider"
import { getProducts } from "@/lib/api"
import { debounce } from "lodash"

interface SearchSuggestion {
  id: string
  text: string
  type: "product" | "category" | "brand"
  count?: number
}

export function SmartSearch() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isListening, setIsListening] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const { withLoading } = useLoading()

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        const products = await getProducts({ search: searchQuery, limit: 5 })
        const mockSuggestions: SearchSuggestion[] = [
          ...products.map((product) => ({
            id: product.id,
            text: product.name,
            type: "product" as const,
            count: 1,
          })),
          {
            id: "cat-1",
            text: "Smartphones",
            type: "category" as const,
            count: 156,
          },
          {
            id: "brand-1",
            text: "Apple",
            type: "brand" as const,
            count: 89,
          },
        ]

        setSuggestions(mockSuggestions.slice(0, 6))
        setShowSuggestions(true)
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setIsSearching(false)
      }
    }, 300),
    [],
  )

  useEffect(() => {
    debouncedSearch(query)
    return () => {
      debouncedSearch.cancel()
    }
  }, [query, debouncedSearch])

  const handleVoiceSearch = () => {
    setIsListening(true)
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } else {
      setIsListening(false)
      alert("Voice search not supported in this browser")
    }
  }

  const handleImageSearch = async () => {
    await withLoading(new Promise((resolve) => setTimeout(resolve, 1500)))
    console.log("Image search triggered")
  }

  const clearSearch = () => {
    setQuery("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products, brands, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-24"
          onFocus={() => query.length > 1 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearSearch}>
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleVoiceSearch} disabled={isListening}>
            <Mic className={`h-3 w-3 ${isListening ? "text-red-500 animate-pulse" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleImageSearch}>
            <Camera className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Smart Suggestions */}
      {showSuggestions && (
        <Card className="absolute top-full mt-1 w-full z-50 p-2 animate-in fade-in-50 slide-in-from-top-2 duration-200">
          {isSearching ? (
            <div className="flex items-center justify-center p-4">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-1">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
                  onClick={() => {
                    setQuery(suggestion.text)
                    setShowSuggestions(false)
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{suggestion.text}</span>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </div>
                  {suggestion.count && (
                    <span className="text-xs text-muted-foreground">{suggestion.count} results</span>
                  )}
                </div>
              ))}
            </div>
          ) : query.length > 1 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">No results found for "{query}"</div>
          ) : null}
        </Card>
      )}
    </div>
  )
}
