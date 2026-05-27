"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Database, Edit, ArrowUpRight, ShieldCheck, X } from "lucide-react"
import { toast } from "sonner"

export default function AdminInventoryPage() {
  const [inventories, setInventories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Edit stock state
  const [isOpen, setIsOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [adjustQty, setAdjustQty] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadInventory = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/inventory")
      if (res.ok) {
        const data = await res.json()
        setInventories(data || [])
      } else {
        toast.error("Failed to load inventory levels")
      }
    } catch (err) {
      toast.error("Failed to execute database fetch")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVariant || !adjustQty) {
      toast.error("Please enter a valid quantity")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: selectedVariant.variantId,
          quantity: Number(adjustQty),
        }),
      })

      if (res.ok) {
        toast.success("Inventory stock adjusted successfully!")
        setIsOpen(false)
        setSelectedVariant(null)
        setAdjustQty("")
        await loadInventory()
      } else {
        toast.error("Failed to adjust inventory level")
      }
    } catch (err) {
      toast.error("An unexpected system exception occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-slate-400 mt-2">Loading stock levels...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-snug">Inventory Stock Matrix</h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Track raw quantities, active reservation blocks, and bin locations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventories.map((inv) => {
          const name = inv.variant?.product?.name || "SKU Variant"
          const optionString = `${inv.variant?.colorName || inv.variant?.color} - ${inv.variant?.size}`
          return (
            <Card key={inv.id} className="border border-slate-100 rounded-2xl shadow-sm bg-card overflow-hidden flex flex-col justify-between">
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800 line-clamp-1">{name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">
                      Option: {optionString} | SKU: {inv.variant?.sku}
                    </p>
                  </div>
                  <Database className="h-4.5 w-4.5 text-primary shrink-0" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-center">
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Raw Quantity</span>
                    <span className="text-base font-extrabold text-slate-800 mt-0.5">{inv.quantity}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Reserved</span>
                    <span className="text-base font-extrabold text-amber-600 mt-0.5">{inv.reserved}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Available</span>
                    <span className="text-base font-extrabold text-green-600 mt-0.5">{inv.quantity - inv.reserved}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 border-t border-slate-100 p-4 flex justify-between items-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Bin: {inv.location || "Default Shelf"}
                </span>
                <Button
                  onClick={() => {
                    setSelectedVariant(inv)
                    setIsOpen(true)
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-8 px-3 border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" /> Adjust Stock
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Adjust Stock Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#0e0918]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-1">Adjust Inventory Quantity</h3>
            <p className="text-xs text-slate-400 mb-6 font-semibold">Enter a positive number to add stock, or a negative value to decrement levels.</p>

            <form onSubmit={handleAdjust} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Quantity Delta</label>
                <Input
                  type="number"
                  placeholder="e.g. +10 or -5"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="h-11 border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="h-10 rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 rounded-xl bg-primary text-white text-xs font-bold"
                >
                  {isSubmitting ? "Adjusting..." : "Apply Adjustment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
