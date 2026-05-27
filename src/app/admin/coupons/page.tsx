"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Coins, Plus, Calendar, Star, X } from "lucide-react"
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
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-slate-400 mt-2">Loading discount coupons...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-snug">Coupon Codes Registry</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage discounts types and platforms usage limits.</p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-11 px-5 rounded-xl bg-primary text-white font-bold"
        >
          <Plus className="h-4.5 w-4.5 mr-2" /> Add Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <Card key={c.id} className="border border-slate-100 rounded-2xl shadow-sm bg-card overflow-hidden flex flex-col justify-between">
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800">{c.code}</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    Type: {c.discountType} | Min: Rs. {c.minOrderAmount}
                  </p>
                </div>
                <Coins className="h-4.5 w-4.5 text-primary shrink-0" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-center">
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Discount Value</span>
                  <span className="text-base font-extrabold text-slate-800 mt-0.5">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `Rs. ${c.discountValue}`}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Used Count</span>
                  <span className="text-base font-extrabold text-slate-700 mt-0.5">{c.usedCount} Times</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Coupon Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#0e0918]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-1">Create Coupon Code</h3>
            <p className="text-xs text-slate-400 mb-6 font-semibold">Define the promotion parameters for checkout integrations.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Coupon Code</label>
                <Input
                  type="text"
                  placeholder="e.g. ULTRA50"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-11 border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="h-10 border border-slate-200 rounded-xl w-full text-xs font-bold text-slate-600 px-3 outline-none"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED_AMOUNT">Fixed Amount</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Value</label>
                  <Input
                    type="number"
                    placeholder="20"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="h-10 border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Minimum Order Amount (Rs.)</label>
                <Input
                  type="number"
                  placeholder="500"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
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
                  {isSubmitting ? "Creating..." : "Create Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
