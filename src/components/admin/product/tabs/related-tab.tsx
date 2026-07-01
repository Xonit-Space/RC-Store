"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { assignRelatedProducts, getRelatedProducts, getProducts } from "@/actions/product"
import { Button } from "@/components/ui/button"

export function RelatedTab({ product, localRelated, setLocalRelated }: { product?: any, localRelated: string[], setLocalRelated: React.Dispatch<React.SetStateAction<string[]>> }) {
  const productId = product?.id
  const isLocalMode = !productId

  const { data: allProducts } = useQuery({
    queryKey: ["admin", "products", "all"],
    queryFn: () => getProducts({ limit: 100 }),
  })

  // Exclude current product if editing
  const availableProducts = allProducts?.data?.filter((p: any) => p.id !== productId) || []
  
  const [selectedIds, setSelectedIds] = useState<string[]>(localRelated)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(!isLocalMode)

  useEffect(() => {
    if (isLocalMode) {
      setSelectedIds(localRelated)
      return
    }
    const loadRelated = async () => {
      try {
        const related = await getRelatedProducts(productId)
        setSelectedIds(related.map((r: any) => r.id))
      } catch {
        // silently fail
      } finally {
        setIsLoading(false)
      }
    }
    if (productId) loadRelated()
  }, [productId, isLocalMode, localRelated])

  const toggleRelated = (id: string) => {
    const newIds = selectedIds.includes(id) ? selectedIds.filter(rId => rId !== id) : [...selectedIds, id]
    setSelectedIds(newIds)
    if (isLocalMode) setLocalRelated(newIds)
  }

  const handleSaveRelated = async () => {
    if (isLocalMode) {
      toast.success("Related products saved to draft")
      return
    }
    setIsSubmitting(true)
    const res = await assignRelatedProducts(productId, selectedIds)
    if (res.success) {
      toast.success("Related products assigned successfully")
    } else {
      toast.error(res.error || "Failed to assign related products")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-border/40 pb-4">
        <h3 className="font-sans text-2xl font-light text-foreground">Related Products</h3>
        {!isLocalMode && (
          <Button 
            onClick={handleSaveRelated} 
            disabled={isSubmitting || isLoading}
            className="h-10 px-4 rounded-none bg-foreground text-background font-bold text-[10px] tracking-widest uppercase"
          >
            {isSubmitting ? "Saving..." : "Save Related"}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center py-4">Loading products...</p>
        ) : availableProducts?.length === 0 ? (
          <div className="border border-border/40 p-8 text-center bg-white dark:bg-background">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">No other products available in store.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableProducts.map((p: any) => {
              const isSelected = selectedIds.includes(p.id)
              return (
                <div 
                  key={p.id} 
                  onClick={() => toggleRelated(p.id)}
                  className={`cursor-pointer border p-4 flex justify-between items-center transition-colors ${
                    isSelected ? 'border-foreground bg-foreground/5' : 'border-border/40 bg-white dark:bg-background hover:border-foreground/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 border flex items-center justify-center ${isSelected ? 'border-foreground bg-foreground' : 'border-muted-foreground'}`}>
                      {isSelected && <div className="w-2 h-2 bg-background" />}
                    </div>
                    {p.images?.[0] && <img src={p.images[0].url} alt={p.name} className="w-10 h-10 object-cover" />}
                    <div>
                      <p className="text-sm font-bold line-clamp-1">{p.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.category?.name || "Uncategorized"}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
