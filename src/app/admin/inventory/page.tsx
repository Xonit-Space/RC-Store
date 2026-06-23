"use client"

import { useState } from "react"
import {
  RefreshCw, Package, Plus, Minus, AlertTriangle,
  CheckCircle2, XCircle, X, Search, Database,
} from "lucide-react"
import { toast } from "sonner"
import { useAdminInventory } from "@/hooks/use-admin-data"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Stock-level color helpers ────────────────────────────────────────────────

function StockIndicator({ available, total }: { available: number; total: number }) {
  if (available === 0)
    return (
      <div className="flex items-center gap-1.5">
        <XCircle className="w-3.5 h-3.5 text-red-500" />
        <span className="text-lg font-bold text-red-500">0</span>
        <span className="text-[9px] uppercase tracking-widest text-red-500 font-bold ml-1">Out of Stock</span>
      </div>
    )
  if (available < 10)
    return (
      <div className="flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-lg font-bold text-amber-500">{available}</span>
        <span className="text-[9px] uppercase tracking-widest text-amber-500 font-bold ml-1">Low Stock</span>
      </div>
    )
  return (
    <div className="flex items-center gap-1.5">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      <span className="text-lg font-bold text-emerald-500">{available}</span>
    </div>
  )
}

// ─── Quick Restock Modal ──────────────────────────────────────────────────────

interface RestockItem {
  id: string
  variantId: string
  productName: string
  sku: string
  size: string
  quantity: number
}

function RestockModal({
  item,
  onClose,
  onSave,
}: {
  item: RestockItem
  onClose: () => void
  onSave: (variantId: string, delta: number) => Promise<void>
}) {
  const [delta, setDelta] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (delta === 0) {
      toast.error("Please enter a non-zero quantity adjustment")
      return
    }
    setSaving(true)
    await onSave(item.variantId, delta)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-background border border-border shadow-2xl p-8 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-muted-foreground hover:text-foreground transition"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-sans text-xl font-light text-foreground mb-1">Quick Restock</h3>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
          Adjust inventory for this SKU
        </p>

        <div className="space-y-1 mb-6 border border-border/30 p-4 bg-muted/5">
          <p className="text-sm font-medium text-foreground">{item.productName}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            SKU: {item.sku} · Size: {item.size}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Current stock: <span className="font-bold text-foreground">{item.quantity}</span>
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
            Quantity Adjustment
          </label>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
            Use positive to add stock (+), negative to reduce (−)
          </p>

          {/* Stepper */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDelta((d) => d - 1)}
              className="w-10 h-10 border border-border/60 flex items-center justify-center hover:border-foreground transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <Input
              type="number"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              className="h-10 text-center bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground font-bold text-lg w-24"
            />
            <button
              type="button"
              onClick={() => setDelta((d) => d + 1)}
              className="w-10 h-10 border border-border/60 flex items-center justify-center hover:border-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {delta !== 0 && (
            <p className={`text-[10px] font-bold uppercase tracking-widest ${delta > 0 ? "text-emerald-500" : "text-red-500"}`}>
              New stock after adjustment: {Math.max(0, item.quantity + delta)}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-border/40">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-none border-border/60 text-xs font-bold uppercase tracking-widest flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || delta === 0}
            className="h-10 rounded-none bg-foreground text-background text-xs font-bold uppercase tracking-widest flex-1"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminInventoryPage() {
  const { data: inventory = [], isLoading: loading } = useAdminInventory()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [restockItem, setRestockItem] = useState<RestockItem | null>(null)

  const filtered = inventory.filter((item: any) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      item.variant?.product?.name?.toLowerCase().includes(q) ||
      item.variant?.sku?.toLowerCase().includes(q)
    )
  })

  // Summary stats
  const totalUnits = inventory.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0)
  const outOfStock = inventory.filter((i: any) => i.quantity === 0).length
  const lowStock = inventory.filter((i: any) => i.quantity > 0 && i.quantity < 10).length

  const handleRestock = async (variantId: string, delta: number) => {
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: delta }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || "Failed to update stock")
      } else {
        toast.success(`Stock updated by ${delta > 0 ? "+" : ""}${delta} units`)
        queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] })
      }
    } catch {
      toast.error("Failed to update stock")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">
          Loading Stock...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      {/* ── Page header ── */}
      <div className="pb-6 border-b border-border/40">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
          Warehousing
        </p>
        <h2 className="font-sans text-3xl font-light text-foreground leading-none">
          Stock Management
        </h2>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
          {inventory.length} SKU variants tracked
        </p>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-border/40 p-5 bg-muted/5">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Total Units</p>
          </div>
          <p className="text-2xl font-light text-foreground">{totalUnits.toLocaleString()}</p>
        </div>
        <div className="border border-amber-500/30 p-5 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-[9px] uppercase tracking-widest text-amber-500 font-bold">Low Stock</p>
          </div>
          <p className="text-2xl font-light text-amber-500">{lowStock}</p>
        </div>
        <div className="border border-red-500/30 p-5 bg-red-500/5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <p className="text-[9px] uppercase tracking-widest text-red-500 font-bold">Out of Stock</p>
          </div>
          <p className="text-2xl font-light text-red-500">{outOfStock}</p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by product or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 bg-transparent border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-foreground placeholder:uppercase placeholder:tracking-wider placeholder:text-[10px]"
        />
      </div>

      {/* ── Inventory table ── */}
      <div className="border border-border/40 bg-background overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 border-b border-border/40">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Product / SKU
                </th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                  Available
                </th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                  Reserved
                </th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Location
                </th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                      {search ? "No results matching your search" : "No stock tracking configured"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item: any) => {
                  const available = item.quantity - item.reserved
                  return (
                    <tr key={item.id} className="hover:bg-muted/5 transition-colors group">
                      <td className="p-4">
                        <p className="font-sans text-sm text-foreground line-clamp-1">
                          {item.variant?.product?.name || "Unknown Product"}
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                          SKU: {item.variant?.sku}
                          {item.variant?.size ? ` · ${item.variant.size}` : ""}
                          {item.variant?.color ? ` · ${item.variant.color}` : ""}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <StockIndicator available={available} total={item.quantity} />
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm text-muted-foreground">{item.reserved}</span>
                      </td>
                      <td className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {item.warehouse?.name || "Main Warehouse"}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() =>
                            setRestockItem({
                              id: item.id,
                              variantId: item.variantId,
                              productName: item.variant?.product?.name || "Product",
                              sku: item.variant?.sku || "",
                              size: item.variant?.size || "",
                              quantity: available,
                            })
                          }
                          className="text-[9px] font-bold uppercase tracking-widest border border-border/40 px-3 py-2 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick Restock Modal ── */}
      {restockItem && (
        <RestockModal
          item={restockItem}
          onClose={() => setRestockItem(null)}
          onSave={handleRestock}
        />
      )}
    </div>
  )
}
