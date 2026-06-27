"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getTaxRates, updateTaxRate } from "@/actions/tax"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

export default function AdminTaxRatesPage() {
  const [rates, setRates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const res = await getTaxRates()
      if (res.success && res.data) {
        setRates(res.data)
      }
      setIsLoading(false)
    }
    load()
  }, [])

  const handleUpdate = async (id: string, rate: number, isActive: boolean) => {
    setIsSubmitting(id)
    try {
      const res = await updateTaxRate(id, rate, isActive)
      if (res.success) {
        toast.success("Tax rate updated")
      } else {
        toast.error("Failed to update tax rate")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(null)
    }
  }

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="pb-6 border-b border-border/40">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
          Configuration
        </p>
        <h2 className="font-sans text-3xl font-light text-foreground leading-none">
          Tax Rates
        </h2>
      </div>

      <div className="border border-border/40 bg-background p-8 space-y-6">
        <div className="grid grid-cols-4 gap-4 pb-4 border-b border-border/40 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          <div>Region</div>
          <div>Tax Rate Name</div>
          <div>Rate (Decimal)</div>
          <div>Actions</div>
        </div>

        {rates.map(rate => (
          <div key={rate.id} className="grid grid-cols-4 gap-4 items-center">
            <div className="text-sm font-semibold">{rate.region?.name || "Global"}</div>
            <div className="text-sm text-muted-foreground">{rate.name}</div>
            <div>
              <Input 
                type="number"
                step="0.01"
                min="0"
                value={rate.rate}
                onChange={e => {
                  const updated = [...rates];
                  const i = updated.findIndex(r => r.id === rate.id);
                  updated[i].rate = e.target.value;
                  setRates(updated);
                }}
                className="h-10 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
              />
            </div>
            <div>
              <Button
                onClick={() => handleUpdate(rate.id, Number(rate.rate), rate.isActive)}
                disabled={isSubmitting === rate.id}
                className="h-10 rounded-none bg-foreground text-background text-xs font-bold uppercase tracking-widest px-6 hover:bg-foreground/90 transition-colors"
              >
                {isSubmitting === rate.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
              </Button>
            </div>
          </div>
        ))}
        
        {rates.length === 0 && (
          <p className="text-sm text-muted-foreground">No tax rates found. Ensure regions are seeded properly.</p>
        )}
      </div>
    </div>
  )
}
