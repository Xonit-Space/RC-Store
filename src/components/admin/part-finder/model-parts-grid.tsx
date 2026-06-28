"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getCompatibleParts, unlinkProductFromModel } from "@/actions/part-finder"
import { Package, Plus, Edit, Link2Off, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "sonner"
import { useState } from "react"

interface ModelPartsGridProps {
  modelId: string
  onEditPart: (productId: string) => void
  onAddPart: () => void
}

export function ModelPartsGrid({ modelId, onEditPart, onAddPart }: ModelPartsGridProps) {
  const queryClient = useQueryClient()
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null)

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["admin", "model-parts", modelId],
    queryFn: () => getCompatibleParts(modelId)
  })

  const handleUnlink = async (productId: string) => {
    if (!confirm("Are you sure you want to remove this part from this model? It will not be deleted from the store.")) return
    
    setIsUnlinking(productId)
    try {
      await unlinkProductFromModel(productId, modelId)
      toast.success("Part unlinked from model")
      queryClient.invalidateQueries({ queryKey: ["admin", "model-parts", modelId] })
      queryClient.invalidateQueries({ queryKey: ["admin", "product-compatibility", productId] })
    } catch {
      toast.error("Failed to unlink part")
    } finally {
      setIsUnlinking(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin mb-2" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Loading parts...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-foreground">Compatible Parts ({parts.length})</p>
        <Button 
          onClick={onAddPart}
          className="h-8 px-4 rounded-none bg-foreground text-background font-semibold text-[10px] uppercase tracking-widest hover:bg-foreground/90 transition-colors"
        >
          <Plus className="h-3 w-3 mr-2" /> Add Part
        </Button>
      </div>

      {/* Grid */}
      {parts.length === 0 ? (
        <div className="border border-border/40 p-8 text-center bg-white dark:bg-background">
          <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">No parts assigned to this model.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {parts.map((p: any) => {
            const thumb = p.images?.[0]?.url || null
            return (
              <div
                key={p.id}
                className="bg-white dark:bg-background border border-border/40 p-3 flex items-start gap-3 group hover:border-racing-yellow/50 transition-colors shadow-sm relative"
              >
                <div className="w-12 h-12 shrink-0 border border-border/30 overflow-hidden bg-muted/10 relative">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 pr-8">
                  <h4 className="font-sans text-sm font-light text-foreground line-clamp-1 leading-tight mb-1">{p.name}</h4>
                  <p className="text-[10px] font-bold text-foreground">
                    {Number(p.price).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
                  </p>
                </div>

                {/* Hover Actions */}
                <div className="absolute right-3 top-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEditPart(p.id)}
                    className="p-1.5 bg-muted/50 text-foreground hover:bg-foreground hover:text-background rounded-sm transition-colors"
                    title="Edit Part"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleUnlink(p.id)}
                    disabled={isUnlinking === p.id}
                    className="p-1.5 bg-muted/50 text-terracotta hover:bg-terracotta hover:text-white rounded-sm transition-colors disabled:opacity-50"
                    title="Unlink from Model"
                  >
                    <Link2Off className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
