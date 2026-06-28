"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getShippingRules, createShippingRule, updateShippingRule, deleteShippingRule } from "@/actions/shipping"
import { toast } from "sonner"
import { Loader2, Save, Trash, Plus } from "lucide-react"

export default function AdminShippingRulesPage() {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)

  // New rule state
  const [isAdding, setIsAdding] = useState(false)
  const [newRule, setNewRule] = useState({ name: "", minOrderAmount: "", maxOrderAmount: "", shippingCost: "" })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setIsLoading(true)
    const res = await getShippingRules()
    if (res.success && res.data) {
      setRules(res.data)
    }
    setIsLoading(false)
  }

  const handleUpdate = async (rule: any) => {
    setIsSubmitting(rule.id)
    try {
      const res = await updateShippingRule(rule.id, {
        name: rule.name,
        minOrderAmount: rule.minOrderAmount ? Number(rule.minOrderAmount) : null,
        maxOrderAmount: rule.maxOrderAmount ? Number(rule.maxOrderAmount) : null,
        shippingCost: Number(rule.shippingCost),
        isActive: rule.isActive
      })
      if (res.success) {
        toast.success("Shipping rule updated")
        load()
      } else {
        toast.error("Failed to update shipping rule")
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
      const res = await deleteShippingRule(id)
      if (res.success) {
        toast.success("Shipping rule deleted")
        load()
      } else {
        toast.error("Failed to delete rule")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(null)
    }
  }

  const handleCreate = async () => {
    if (!newRule.name || !newRule.shippingCost) {
      toast.error("Name and shipping cost are required")
      return
    }
    setIsSubmitting("new")
    try {
      const res = await createShippingRule({
        name: newRule.name,
        minOrderAmount: newRule.minOrderAmount ? Number(newRule.minOrderAmount) : undefined,
        maxOrderAmount: newRule.maxOrderAmount ? Number(newRule.maxOrderAmount) : undefined,
        shippingCost: Number(newRule.shippingCost),
        isActive: true
      })
      if (res.success) {
        toast.success("Shipping rule created")
        setNewRule({ name: "", minOrderAmount: "", maxOrderAmount: "", shippingCost: "" })
        setIsAdding(false)
        load()
      } else {
        toast.error("Failed to create rule")
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
            Shipping Rules
          </h2>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-primary text-black font-bold h-10 rounded-none hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Add Rule
        </Button>
      </div>

      {isAdding && (
        <div className="border border-border/40 bg-muted/5 p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-widest text-foreground">Create New Rule</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Name</label>
              <Input value={newRule.name} onChange={e => setNewRule(prev => ({...prev, name: e.target.value}))} placeholder="e.g. Free above $150" className="h-10 rounded-none bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Min Subtotal ($)</label>
              <Input type="number" value={newRule.minOrderAmount} onChange={e => setNewRule(prev => ({...prev, minOrderAmount: e.target.value}))} placeholder="Optional" className="h-10 rounded-none bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Max Subtotal ($)</label>
              <Input type="number" value={newRule.maxOrderAmount} onChange={e => setNewRule(prev => ({...prev, maxOrderAmount: e.target.value}))} placeholder="Optional" className="h-10 rounded-none bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Shipping Cost ($)</label>
              <Input type="number" value={newRule.shippingCost} onChange={e => setNewRule(prev => ({...prev, shippingCost: e.target.value}))} placeholder="e.g. 15.00" className="h-10 rounded-none bg-background" />
            </div>
            <Button onClick={handleCreate} disabled={isSubmitting === "new"} className="h-10 rounded-none bg-foreground text-background">
              {isSubmitting === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Rule"}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 p-8 space-y-6">
        <div className="grid grid-cols-5 gap-4 pb-4 border-b border-border/40 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          <div>Rule Name</div>
          <div>Min Order ($)</div>
          <div>Max Order ($)</div>
          <div>Shipping Fee ($)</div>
          <div>Actions</div>
        </div>

        {rules.map(rule => (
          <div key={rule.id} className="grid grid-cols-5 gap-4 items-center">
            <div>
              <Input 
                value={rule.name}
                onChange={e => {
                  const updated = [...rules];
                  const i = updated.findIndex(r => r.id === rule.id);
                  updated[i].name = e.target.value;
                  setRules(updated);
                }}
                className="h-10 bg-transparent border-border/60 rounded-none focus-visible:ring-0"
              />
            </div>
            <div>
              <Input 
                type="number"
                value={rule.minOrderAmount || ""}
                onChange={e => {
                  const updated = [...rules];
                  const i = updated.findIndex(r => r.id === rule.id);
                  updated[i].minOrderAmount = e.target.value;
                  setRules(updated);
                }}
                placeholder="0.00"
                className="h-10 bg-transparent border-border/60 rounded-none focus-visible:ring-0"
              />
            </div>
            <div>
              <Input 
                type="number"
                value={rule.maxOrderAmount || ""}
                onChange={e => {
                  const updated = [...rules];
                  const i = updated.findIndex(r => r.id === rule.id);
                  updated[i].maxOrderAmount = e.target.value;
                  setRules(updated);
                }}
                placeholder="No max"
                className="h-10 bg-transparent border-border/60 rounded-none focus-visible:ring-0"
              />
            </div>
            <div>
              <Input 
                type="number"
                value={rule.shippingCost}
                onChange={e => {
                  const updated = [...rules];
                  const i = updated.findIndex(r => r.id === rule.id);
                  updated[i].shippingCost = e.target.value;
                  setRules(updated);
                }}
                className="h-10 bg-transparent border-border/60 rounded-none focus-visible:ring-0"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleUpdate(rule)}
                disabled={isSubmitting === rule.id}
                className="h-10 rounded-none bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-4 hover:bg-foreground/90 transition-colors"
              >
                {isSubmitting === rule.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
              <Button
                onClick={() => handleDelete(rule.id)}
                disabled={isSubmitting === rule.id}
                variant="destructive"
                className="h-10 w-10 rounded-none p-0"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No shipping rules defined. Default cost will apply.</p>
        )}
      </div>
    </div>
  )
}
