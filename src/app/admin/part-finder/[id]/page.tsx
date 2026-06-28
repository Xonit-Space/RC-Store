"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { getVehicleModels, getCompatibleParts, linkProductToModel, unlinkProductFromModel } from "@/actions/part-finder"
import { ArrowLeft, Search, Plus, X, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ManagePartsPage({ params }: { params: { id: string } }) {
  const [model, setModel] = useState<any>(null)
  const [compatibleParts, setCompatibleParts] = useState<any[]>([])
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const loadModelAndParts = async () => {
    try {
      const models = await getVehicleModels()
      const currentModel = models.find(m => m.id === params.id)
      if (currentModel) setModel(currentModel)

      const parts = await getCompatibleParts(params.id)
      setCompatibleParts(parts)
    } catch (error) {
      toast.error("Failed to load data")
    }
  }

  useEffect(() => {
    loadModelAndParts()
  }, [params.id])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return
    setIsSearching(true)
    try {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(searchQuery)}&limit=10`)
      const data = await res.json()
      // Filter out products that are already linked
      const existingIds = new Set(compatibleParts.map(p => p.id))
      setSearchResults(data.data.filter((p: any) => !existingIds.has(p.id)))
    } catch (error) {
      toast.error("Failed to search products")
    } finally {
      setIsSearching(false)
    }
  }

  const handleLinkProduct = async (productId: string) => {
    try {
      await linkProductToModel(params.id, productId)
      toast.success("Part linked successfully")
      // Remove from search results and reload parts
      setSearchResults(prev => prev.filter(p => p.id !== productId))
      loadModelAndParts()
    } catch {
      toast.error("Failed to link part")
    }
  }

  const handleUnlinkProduct = async (productId: string) => {
    try {
      await unlinkProductFromModel(params.id, productId)
      toast.success("Part unlinked")
      loadModelAndParts()
    } catch {
      toast.error("Failed to unlink part")
    }
  }

  if (!model) return <div className="p-12 text-center">Loading...</div>

  return (
    <div className="space-y-8 font-sans">
      <div className="pb-6 border-b border-border/40 flex items-center justify-between">
        <div>
          <Link href="/admin/part-finder" className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-1 hover:underline mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Part Finder
          </Link>
          <h2 className="text-3xl font-light text-foreground leading-none">
            {model.make?.name} {model.name}
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
            Manage Compatible Parts ({compatibleParts.length} linked)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LINKED PARTS */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-forest" /> Linked Parts
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {compatibleParts.length === 0 ? (
              <p className="text-xs text-muted-foreground italic border border-dashed border-border/40 p-8 text-center">No parts linked to this model yet.</p>
            ) : (
              compatibleParts.map(part => (
                <div key={part.id} className="flex items-center gap-3 p-3 bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_40px_rgba(255,204,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_50px_rgba(255,204,0,0.3)] hover:border-racing-yellow/50 transition-all duration-300 group hover:border-foreground/30 transition-colors">
                  <div className="h-10 w-10 shrink-0 bg-muted/10 border border-border/40 flex items-center justify-center overflow-hidden">
                    {part.images?.[0]?.url ? (
                      <Image src={part.images[0].url} alt="" width={40} height={40} className="object-cover" />
                    ) : (
                      <Package className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{part.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{part.sku || "NO SKU"}</p>
                  </div>
                  <button 
                    onClick={() => handleUnlinkProduct(part.id)}
                    className="p-2 text-terracotta hover:bg-terracotta/10 shrink-0"
                    title="Unlink"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SEARCH & ADD PARTS */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" /> Find Products to Link
          </h3>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="flex-1 bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_40px_rgba(255,204,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_50px_rgba(255,204,0,0.3)] hover:border-racing-yellow/50 transition-all duration-300 text-xs p-3 text-foreground focus:border-primary outline-none"
            />
            <button type="submit" disabled={isSearching} className="bg-primary text-primary-foreground px-6 py-2 uppercase tracking-widest text-[10px] font-bold disabled:opacity-50 hover:opacity-90">
              Search
            </button>
          </form>

          <div className="space-y-2 mt-4 max-h-[500px] overflow-y-auto">
            {searchResults.length === 0 && searchQuery && !isSearching && (
              <p className="text-xs text-muted-foreground">No matching unlinked products found.</p>
            )}
            {searchResults.map(result => (
              <div key={result.id} className="flex items-center gap-3 p-3 bg-muted/5 border border-border/40">
                <div className="h-10 w-10 shrink-0 bg-muted/10 border border-border/40 flex items-center justify-center overflow-hidden">
                  {result.images?.[0]?.url ? (
                    <Image src={result.images[0].url} alt="" width={40} height={40} className="object-cover" />
                  ) : (
                    <Package className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{result.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{result.sku || "NO SKU"}</p>
                </div>
                <button 
                  onClick={() => handleLinkProduct(result.id)}
                  className="p-2 text-forest hover:bg-forest/10 shrink-0 border border-forest/20 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> <span className="text-[10px] uppercase tracking-widest font-bold">Link</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
