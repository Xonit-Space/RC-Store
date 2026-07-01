"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { assignAddonsToProduct, getProductAddons, getAddons } from "@/actions/product"
import { Button } from "@/components/ui/button"

export function AddonsTab({ product, localAddons, setLocalAddons }: { product?: any, localAddons: string[], setLocalAddons: React.Dispatch<React.SetStateAction<string[]>> }) {
  const queryClient = useQueryClient()
  const productId = product?.id
  const isLocalMode = !productId

  const { data: availableAddons } = useQuery({
    queryKey: ["admin", "addons"],
    queryFn: () => getAddons(),
  })

  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(localAddons)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(!isLocalMode)

  useEffect(() => {
    if (isLocalMode) {
      setSelectedAddonIds(localAddons)
      return
    }
    const loadAddons = async () => {
      try {
        const addons = await getProductAddons(productId)
        setSelectedAddonIds(addons.map((a: any) => a.id))
      } catch {
        // silently fail
      } finally {
        setIsLoading(false)
      }
    }
    if (productId) loadAddons()
  }, [productId, isLocalMode, localAddons])

  const toggleAddon = (id: string) => {
    const newIds = selectedAddonIds.includes(id) ? selectedAddonIds.filter(aId => aId !== id) : [...selectedAddonIds, id]
    setSelectedAddonIds(newIds)
    if (isLocalMode) setLocalAddons(newIds)
  }

  const handleSaveAddons = async () => {
    if (isLocalMode) {
      toast.success("Addons saved to draft")
      return
    }
    setIsSubmitting(true)
    const res = await assignAddonsToProduct(productId, selectedAddonIds)
    if (res.success) {
      toast.success("Addons assigned successfully")
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
    } else {
      toast.error(res.error || "Failed to assign addons")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-border/40 pb-4">
        <h3 className="font-sans text-2xl font-light text-foreground">Addons</h3>
        {!isLocalMode && (
          <Button 
            onClick={handleSaveAddons} 
            disabled={isSubmitting || isLoading}
            className="h-10 px-4 rounded-none bg-foreground text-background font-bold text-[10px] tracking-widest uppercase"
          >
            {isSubmitting ? "Saving..." : "Save Addons"}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center py-4">Loading addons...</p>
        ) : availableAddons?.length === 0 ? (
          <div className="border border-border/40 p-8 text-center bg-white dark:bg-background">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">No addons available in store.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableAddons?.map((addon: any) => {
              const isSelected = selectedAddonIds.includes(addon.id)
              return (
                <div 
                  key={addon.id} 
                  onClick={() => toggleAddon(addon.id)}
                  className={`cursor-pointer border p-4 flex justify-between items-center transition-colors ${
                    isSelected ? 'border-foreground bg-foreground/5' : 'border-border/40 bg-white dark:bg-background hover:border-foreground/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 border flex items-center justify-center ${isSelected ? 'border-foreground bg-foreground' : 'border-muted-foreground'}`}>
                      {isSelected && <div className="w-2 h-2 bg-background" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{addon.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {Number(addon.price).toLocaleString("en-AU", { style: 'currency', currency: 'AUD' })}
                      </p>
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
