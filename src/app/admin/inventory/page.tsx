"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Package, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { toast } from "sonner"

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadInventory = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/inventory")
      if (res.ok) {
        const data = await res.json()
        setInventory(data || [])
      } else {
        toast.error("Failed to load inventory allocations")
      }
    } catch (err) {
      toast.error("Failed to execute database lookup")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">Loading Stock...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="pb-6 border-b border-border/40">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
          Warehousing
        </p>
        <h2 className="font-sans text-3xl font-light text-foreground leading-none">
          Stock Management
        </h2>
      </div>

      <div className="border border-border/40 bg-background overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 border-b border-border/40">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-1/3">Variant Details</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right w-1/6">Available</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right w-1/6">Reserved</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right w-1/3">Warehouse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">No stock tracking configured</p>
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const available = item.quantity - item.reserved
                  const statusColor = available > 10 ? "text-forest" : available > 0 ? "text-brass" : "text-terracotta"

                  return (
                    <tr key={item.id} className="hover:bg-muted/5 transition-colors group">
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-sans text-sm text-foreground line-clamp-1">{item.variant.product.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            SKU: {item.variant.sku} <span className="mx-2 text-border">|</span> Size: {item.variant.size}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className={`font-sans text-lg ${statusColor}`}>
                          {available}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-sans text-sm text-muted-foreground">
                          {item.reserved}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {item.warehouse?.name || "Main Fulfillment Center"}
                        </p>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
