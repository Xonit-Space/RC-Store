"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"

interface RefundModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  order: any
}

export function RefundModal({ isOpen, onClose, onSuccess, order }: RefundModalProps) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isOpen || !order) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      toast.error("Please provide a reason for the refund")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/customer/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, reason })
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success("Refund request submitted successfully")
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || "Failed to submit request")
      }
    } catch {
      toast.error("SYSTEM MALFUNCTION")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-carbon-dark/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-dark border border-racing-yellow/50 p-8 w-full max-w-md shadow-[0_0_30px_rgba(255, 204, 0,0.15)] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-racing-yellow to-transparent opacity-50" />
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-heading text-2xl font-black tracking-wider text-foreground uppercase">
            Request Refund
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <X strokeWidth={2} className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-[11px] font-mono font-bold tracking-widest uppercase text-foreground mb-1">
            Order #{order.orderNumber}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
            Total: {Number(order.total).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground block">
              Reason for Refund
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you are requesting a refund..."
              required
              rows={4}
              className="w-full bg-muted border border-border p-3 text-sm text-foreground focus:outline-none focus:border-racing-yellow transition-colors font-mono resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-4 border border-border text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-foreground hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-4 bg-primary text-[10px] font-heading font-black tracking-[0.2em] uppercase text-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(255, 204, 0,0.5)] transition-all disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
