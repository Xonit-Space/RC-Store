"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Coins, Plus, X } from "lucide-react"
import { toast } from "sonner"

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Add Coupon form state
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState("")
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE")
  const [discountValue, setDiscountValue] = useState("")
  const [minOrder, setMinOrder] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadCoupons = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/coupons")
      if (res.ok) {
        const data = await res.json()
        setCoupons(data || [])
      } else {
        toast.error("Failed to load discount coupons")
      }
    } catch (err) {
      toast.error("Failed to execute database fetch")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !discountValue) {
      toast.error("Code and discount value are required")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: minOrder ? Number(minOrder) : 0,
        }),
      })

      if (res.ok) {
        toast.success("Successfully registered new discount coupon!")
        setIsOpen(false)
        setCode("")
        setDiscountValue("")
        setMinOrder("")
        await loadCoupons()
      } else {
        toast.error("Failed to register coupon code")
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
        <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">Loading Promotions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
            Marketing
          </p>
          <h2 className="font-sans text-3xl font-light text-foreground leading-none">
            Promotions
          </h2>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 px-6 rounded-none bg-foreground text-background font-bold text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Code
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div key={c.id} className="border border-border/40 bg-background flex flex-col justify-between group transition-colors hover:border-foreground/30">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-sans text-xl font-light text-foreground mb-1">{c.code}</h3>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                    Type: {c.discountType}
                  </p>
                </div>
                <Coins strokeWidth={1} className="h-6 w-6 text-foreground/40 shrink-0" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
                <div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Discount Value</span>
                  <span className="font-sans text-xl text-foreground">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `Rs. ${c.discountValue.toLocaleString()}`}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Used Count</span>
                  <span className="font-sans text-xl text-foreground">{c.usedCount} <span className="text-sm font-sans text-muted-foreground">times</span></span>
                </div>
              </div>
              <div className="pt-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Min. Order Rs.</span>
                <span className="text-xs font-bold text-foreground">{c.minOrderAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Coupon Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-background border border-border shadow-2xl p-8 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-sans text-2xl font-light text-foreground mb-2">New Promotion</h3>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-8">Configure discount code parameters</p>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Coupon Code</label>
                <Input
                  type="text"
                  placeholder="e.g. ATELIER26"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="h-12 bg-transparent border border-border/60 rounded-none w-full text-xs text-foreground px-3 outline-none focus:border-foreground"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED_AMOUNT">Fixed Amount</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Value</label>
                  <Input
                    type="number"
                    placeholder="20"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Min Order Amount (Rs.)</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                />
              </div>

              <div className="flex gap-4 justify-end pt-6 border-t border-border/40 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="h-12 rounded-none border-border/60 text-foreground text-xs font-bold uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 rounded-none bg-foreground text-background text-xs font-bold uppercase tracking-widest px-8"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
