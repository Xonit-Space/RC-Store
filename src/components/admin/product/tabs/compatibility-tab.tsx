"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getVehicleMakes, getVehicleModels, linkProductToModel, unlinkProductFromModel, getProductCompatibleModels } from "@/actions/part-finder"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { RefreshCw, Car } from "lucide-react"

export function CompatibilityTab({ product }: { product: any }) {
  const [assignedModelIds, setAssignedModelIds] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch all makes and models
  const { data: makes = [] } = useQuery({
    queryKey: ["admin", "vehicle-makes"],
    queryFn: () => getVehicleMakes()
  })

  const { data: models = [] } = useQuery({
    queryKey: ["admin", "vehicle-models"],
    queryFn: () => getVehicleModels()
  })

  // Fetch product's current compatibilities
  const { data: assignedModels = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "product-compatibility", product.id],
    queryFn: () => getProductCompatibleModels(product.id)
  })

  useEffect(() => {
    if (assignedModels) {
      setAssignedModelIds(assignedModels.map((m: any) => m.id))
    }
  }, [assignedModels])

  const toggleModel = async (modelId: string, checked: boolean) => {
    setIsUpdating(true)
    try {
      if (checked) {
        await linkProductToModel(modelId, product.id)
        toast.success("Compatibility added")
      } else {
        await unlinkProductFromModel(modelId, product.id)
        toast.success("Compatibility removed")
      }
      refetch()
    } catch (error) {
      toast.error("Failed to update compatibility")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin mb-4" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Loading Compatibilities...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h4 className="text-lg font-semibold text-foreground">Vehicle Compatibility</h4>
        <p className="text-sm text-muted-foreground">Select which RC vehicles this part fits. This powers the Part Finder feature on the store.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {makes.map((make: any) => {
          const makeModels = models.filter((m: any) => m.makeId === make.id)
          if (makeModels.length === 0) return null

          return (
            <div key={make.id} className="border border-border/40 bg-white dark:bg-background p-5 rounded-lg shadow-sm">
              <h5 className="font-bold text-sm uppercase tracking-wider text-foreground mb-4 border-b border-border/40 pb-2">{make.name}</h5>
              <div className="space-y-3">
                {makeModels.map((model: any) => {
                  const isAssigned = assignedModelIds.includes(model.id)
                  return (
                    <label key={model.id} className="flex items-center gap-3 cursor-pointer group">
                      <Checkbox 
                        checked={isAssigned} 
                        onCheckedChange={(checked) => toggleModel(model.id, !!checked)}
                        disabled={isUpdating}
                        className="rounded-sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {model.name} <span className="text-muted-foreground font-normal ml-1">({model.scale})</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{model.type}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {makes.length === 0 && (
        <div className="p-8 text-center border border-border/40 bg-muted/5 rounded-lg">
          <Car className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No vehicle makes found. Add them in the Part Finder settings.</p>
        </div>
      )}
    </div>
  )
}
