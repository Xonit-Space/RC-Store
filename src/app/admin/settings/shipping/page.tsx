"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { getShippingRules, createShippingRule, updateShippingRule, deleteShippingRule } from "@/actions/shipping"
import { getStoreSettings, updateStoreSettings } from "@/actions/settings"
import { toast } from "sonner"
import { Loader2, Trash, Plus } from "lucide-react"

export default function AdminShippingRulesPage() {
  const [rules, setRules] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)

  // New rule state
  const [isAdding, setIsAdding] = useState(false)
  const [newRule, setNewRule] = useState({ 
    name: "", minOrderAmount: "", maxOrderAmount: "", shippingCost: "", 
    courierName: "", estimatedDaysMin: "", estimatedDaysMax: "", logoUrl: "" 
  })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setIsLoading(true)
    const [rulesRes, settingsRes] = await Promise.all([
      getShippingRules(),
      getStoreSettings()
    ])
    
    if (rulesRes.success && rulesRes.data) {
      setRules(rulesRes.data)
    }
    if (settingsRes.success && settingsRes.data) {
      setSettings(settingsRes.data)
    }
    setIsLoading(false)
  }

  const handleUpdateRule = async (rule: any) => {
    setIsSubmitting(rule.id)
    try {
      const res = await updateShippingRule(rule.id, {
        name: rule.name,
        minOrderAmount: rule.minOrderAmount ? Number(rule.minOrderAmount) : null,
        maxOrderAmount: rule.maxOrderAmount ? Number(rule.maxOrderAmount) : null,
        shippingCost: Number(rule.shippingCost),
        estimatedDaysMin: rule.estimatedDaysMin ? Number(rule.estimatedDaysMin) : null,
        estimatedDaysMax: rule.estimatedDaysMax ? Number(rule.estimatedDaysMax) : null,
        courierName: rule.courierName,
        logoUrl: rule.logoUrl,
        isActive: rule.isActive
      })
      if (res.success) {
        toast.success("Shipping option updated")
        load()
      } else {
        toast.error("Failed to update shipping option")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(null)
    }
  }

  const handleDeleteRule = async (id: string) => {
    setIsSubmitting(id)
    try {
      const res = await deleteShippingRule(id)
      if (res.success) {
        toast.success("Shipping option deleted")
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

  const handleCreateRule = async () => {
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
        estimatedDaysMin: newRule.estimatedDaysMin ? Number(newRule.estimatedDaysMin) : undefined,
        estimatedDaysMax: newRule.estimatedDaysMax ? Number(newRule.estimatedDaysMax) : undefined,
        courierName: newRule.courierName,
        logoUrl: newRule.logoUrl,
        isActive: true
      })
      if (res.success) {
        toast.success("Shipping option created")
        setNewRule({ 
          name: "", minOrderAmount: "", maxOrderAmount: "", shippingCost: "", 
          courierName: "", estimatedDaysMin: "", estimatedDaysMax: "", logoUrl: "" 
        })
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

  const handleUpdateSettings = async () => {
    if (!settings) return;
    setIsSubmitting("settings")
    try {
      const res = await updateStoreSettings({
        shippingInsuranceCost: Number(settings.shippingInsuranceCost),
        enableSafeDrop: settings.enableSafeDrop
      })
      if (res.success) {
        toast.success("Delivery add-ons settings saved")
        load()
      } else {
        toast.error("Failed to save settings")
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
            Shipping & Delivery
          </h2>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-primary text-black font-bold h-10 rounded-none hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Add Shipping Option
        </Button>
      </div>

      {isAdding && (
        <div className="border border-border/40 bg-muted/5 p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-widest text-foreground">Create New Shipping Option</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Option Name</label>
              <Input value={newRule.name} onChange={e => setNewRule(prev => ({...prev, name: e.target.value}))} placeholder="e.g. Express Post" className="h-10 rounded-none bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Courier Name</label>
              <Input value={newRule.courierName} onChange={e => setNewRule(prev => ({...prev, courierName: e.target.value}))} placeholder="e.g. AusPost" className="h-10 rounded-none bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Logo URL</label>
              <Input value={newRule.logoUrl} onChange={e => setNewRule(prev => ({...prev, logoUrl: e.target.value}))} placeholder="https://..." className="h-10 rounded-none bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Shipping Cost ($)</label>
              <Input type="number" value={newRule.shippingCost} onChange={e => setNewRule(prev => ({...prev, shippingCost: e.target.value}))} placeholder="e.g. 18.28" className="h-10 rounded-none bg-background" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Min Subtotal ($) (Optional)</label>
              <Input type="number" value={newRule.minOrderAmount} onChange={e => setNewRule(prev => ({...prev, minOrderAmount: e.target.value}))} placeholder="Optional" className="h-10 rounded-none bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Max Subtotal ($) (Optional)</label>
              <Input type="number" value={newRule.maxOrderAmount} onChange={e => setNewRule(prev => ({...prev, maxOrderAmount: e.target.value}))} placeholder="Optional" className="h-10 rounded-none bg-background" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Est. Min Days</label>
              <Input type="number" value={newRule.estimatedDaysMin} onChange={e => setNewRule(prev => ({...prev, estimatedDaysMin: e.target.value}))} placeholder="e.g. 3" className="h-10 rounded-none bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Est. Max Days</label>
              <Input type="number" value={newRule.estimatedDaysMax} onChange={e => setNewRule(prev => ({...prev, estimatedDaysMax: e.target.value}))} placeholder="e.g. 6" className="h-10 rounded-none bg-background" />
            </div>
            
            <div className="col-span-2 md:col-span-4 mt-2">
              <Button onClick={handleCreateRule} disabled={isSubmitting === "new"} className="h-10 rounded-none bg-foreground text-background">
                {isSubmitting === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Option"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 p-8 space-y-6">
        <h3 className="font-bold text-sm uppercase tracking-widest text-foreground border-b border-border/40 pb-4">Courier Options</h3>
        
        {rules.map(rule => (
          <div key={rule.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border border-border/20 p-4 bg-muted/5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Name</label>
              <Input 
                value={rule.name}
                onChange={e => {
                  const updated = [...rules];
                  const i = updated.findIndex(r => r.id === rule.id);
                  updated[i].name = e.target.value;
                  setRules(updated);
                }}
                className="h-10 bg-background border-border/60 rounded-none focus-visible:ring-0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Courier</label>
              <Input 
                value={rule.courierName || ""}
                onChange={e => {
                  const updated = [...rules];
                  const i = updated.findIndex(r => r.id === rule.id);
                  updated[i].courierName = e.target.value;
                  setRules(updated);
                }}
                className="h-10 bg-background border-border/60 rounded-none focus-visible:ring-0"
              />
            </div>
             <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase text-muted-foreground">Logo URL</label>
              <Input 
                value={rule.logoUrl || ""}
                onChange={e => {
                  const updated = [...rules];
                  const i = updated.findIndex(r => r.id === rule.id);
                  updated[i].logoUrl = e.target.value;
                  setRules(updated);
                }}
                className="h-10 bg-background border-border/60 rounded-none focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Min Order ($)</label>
              <Input 
                type="number"
                value={rule.minOrderAmount || ""}
                onChange={e => {
                  const updated = [...rules];
                  const i = updated.findIndex(r => r.id === rule.id);
                  updated[i].minOrderAmount = e.target.value;
                  setRules(updated);
                }}
                className="h-10 bg-background border-border/60 rounded-none focus-visible:ring-0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Max Order ($)</label>
              <Input 
                type="number"
                value={rule.maxOrderAmount || ""}
                onChange={e => {
                  const updated = [...rules];
                  const i = updated.findIndex(r => r.id === rule.id);
                  updated[i].maxOrderAmount = e.target.value;
                  setRules(updated);
                }}
                className="h-10 bg-background border-border/60 rounded-none focus-visible:ring-0"
              />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2 space-y-2">
                <label className="text-[10px] uppercase text-muted-foreground">Min Days</label>
                <Input 
                  type="number"
                  value={rule.estimatedDaysMin || ""}
                  onChange={e => {
                    const updated = [...rules];
                    const i = updated.findIndex(r => r.id === rule.id);
                    updated[i].estimatedDaysMin = e.target.value;
                    setRules(updated);
                  }}
                  className="h-10 bg-background border-border/60 rounded-none focus-visible:ring-0"
                />
              </div>
              <div className="w-1/2 space-y-2">
                <label className="text-[10px] uppercase text-muted-foreground">Max Days</label>
                <Input 
                  type="number"
                  value={rule.estimatedDaysMax || ""}
                  onChange={e => {
                    const updated = [...rules];
                    const i = updated.findIndex(r => r.id === rule.id);
                    updated[i].estimatedDaysMax = e.target.value;
                    setRules(updated);
                  }}
                  className="h-10 bg-background border-border/60 rounded-none focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-muted-foreground">Cost ($)</label>
                <Input 
                  type="number"
                  value={rule.shippingCost}
                  onChange={e => {
                    const updated = [...rules];
                    const i = updated.findIndex(r => r.id === rule.id);
                    updated[i].shippingCost = e.target.value;
                    setRules(updated);
                  }}
                  className="h-10 bg-background border-border/60 rounded-none focus-visible:ring-0"
                />
            </div>

            <div className="md:col-span-4 flex gap-2 pt-2">
              <Button
                onClick={() => handleUpdateRule(rule)}
                disabled={isSubmitting === rule.id}
                className="h-10 rounded-none bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-6 hover:bg-foreground/90 transition-colors"
              >
                {isSubmitting === rule.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
              <Button
                onClick={() => handleDeleteRule(rule.id)}
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
          <p className="text-sm text-muted-foreground text-center py-4">No shipping options defined. Default cost will apply.</p>
        )}
      </div>

      <div className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 p-8 space-y-6">
        <h3 className="font-bold text-sm uppercase tracking-widest text-foreground border-b border-border/40 pb-4">Delivery Add-ons</h3>
        
        {settings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Delivery Insurance</h4>
                <p className="text-xs text-muted-foreground mb-4">Set the flat fee cost for delivery insurance offered at checkout.</p>
              </div>
              <div className="space-y-2 max-w-[200px]">
                <label className="text-[10px] uppercase text-muted-foreground">Insurance Cost ($)</label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={settings.shippingInsuranceCost}
                  onChange={e => setSettings({...settings, shippingInsuranceCost: e.target.value})}
                  className="h-10 bg-transparent border-border/60 rounded-none focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Safe Drop Option</h4>
                <p className="text-xs text-muted-foreground mb-4">Allow customers to choose &quot;Safe Drop&quot; (leave delivery in safe place) during checkout.</p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  checked={settings.enableSafeDrop}
                  onCheckedChange={checked => setSettings({...settings, enableSafeDrop: checked})}
                />
                <Label className="text-sm">Enable Safe Drop</Label>
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
               <Button
                onClick={handleUpdateSettings}
                disabled={isSubmitting === "settings"}
                className="h-10 rounded-none bg-primary text-black font-bold text-[10px] uppercase tracking-widest px-6 hover:bg-primary/90 transition-colors"
              >
                {isSubmitting === "settings" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Add-ons Settings"}
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
