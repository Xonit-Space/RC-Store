"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getTaxRates, updateTaxRate, createTaxRate, deleteTaxRate } from "@/actions/tax"
import { toast } from "sonner"
import { Loader2, Plus, Trash } from "lucide-react"

export default function AdminTaxRatesPage() {
  const [rates, setRates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)

  const [isAdding, setIsAdding] = useState(false)
  const [newRule, setNewRule] = useState({ name: "", rate: "" })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setIsLoading(true)
    const res = await getTaxRates()
    if (res.success && res.data) {
      setRates(res.data)
    }
    setIsLoading(false)
  }

  const handleUpdate = async (id: string, rate: number, isActive: boolean) => {
    setIsSubmitting(id)
    try {
      const res = await updateTaxRate(id, rate, isActive)
      if (res.success) {
        toast.success("Tax rate updated")
        load()
      } else {
        toast.error("Failed to update tax rate")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(null)
    }
  }

  const handleDelete = async (id: string) => {
    setIsSubmitting(id)
    try {
      const res = await deleteTaxRate(id)
      if (res.success) {
        toast.success("Tax rate deleted")
        load()
      } else {
        toast.error("Failed to delete tax rate")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(null)
    }
  }

  const handleCreate = async () => {
    if (!newRule.name || !newRule.rate) {
      toast.error("Name and rate are required")
      return
    }
    setIsSubmitting("new")
    try {
      const res = await createTaxRate(newRule.name, Number(newRule.rate), true)
      if (res.success) {
        toast.success("Tax rule created")
        setNewRule({ name: "", rate: "" })
        setIsAdding(false)
        load()
      } else {
        toast.error("Failed to create tax rule")
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
      <div className="flex justify-between items-end pb-6 border-b border-border/40">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
            Configuration
          </p>
          <h2 className="font-sans text-3xl font-light text-foreground leading-none">
            Tax Rates
          </h2>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-primary text-black font-bold h-10 rounded-none hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Add Rule
        </Button>
      </div>

      {isAdding && (
        <div className="border border-border/40 bg-muted/5 p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-widest text-foreground">Create New Tax Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Tax Rate Name</label>
              <Input value={newRule.name} onChange={e => setNewRule(prev => ({...prev, name: e.target.value}))} placeholder="e.g. Standard VAT" className="h-10 rounded-none bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Rate (Decimal, e.g. 0.08)</label>
              <Input type="number" step="0.01" value={newRule.rate} onChange={e => setNewRule(prev => ({...prev, rate: e.target.value}))} placeholder="0.00" className="h-10 rounded-none bg-background" />
            </div>
            <Button onClick={handleCreate} disabled={isSubmitting === "new"} className="h-10 rounded-none bg-foreground text-background">
              {isSubmitting === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Rule"}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 p-8 space-y-6">
        <div className="grid grid-cols-4 gap-4 pb-4 border-b border-border/40 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          <div>Region</div>
          <div>Tax Rate Name</div>
          <div>Rate (Decimal)</div>
          <div>Actions</div>
        </div>

        {rates.map(rate => (
          <div key={rate.id} className="grid grid-cols-4 gap-4 items-center">
            <div className="text-sm font-semibold">{rate.region?.name || "Global"}</div>
            <div>
              <Input 
                value={rate.name}
                onChange={e => {
                  const updated = [...rates];
                  const i = updated.findIndex(r => r.id === rate.id);
                  updated[i].name = e.target.value;
                  setRates(updated);
                }}
                className="h-10 bg-transparent border-border/60 rounded-none focus-visible:ring-0"
              />
            </div>
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
                className="h-10 bg-transparent border-border/60 rounded-none focus-visible:ring-0"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleUpdate(rate.id, Number(rate.rate), rate.isActive)}
                disabled={isSubmitting === rate.id}
                className="h-10 rounded-none bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-4 hover:bg-foreground/90 transition-colors"
              >
                {isSubmitting === rate.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
              <Button
                onClick={() => handleDelete(rate.id)}
                disabled={isSubmitting === rate.id}
                variant="destructive"
                className="h-10 w-10 rounded-none p-0"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {rates.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No tax rates found.</p>
        )}
      </div>
    </div>
  )
}
