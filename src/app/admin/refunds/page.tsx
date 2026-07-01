"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { usePrice } from "@/hooks/use-price"
import Link from "next/link"

export default function AdminRefundsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { formatPrice } = usePrice()

  const loadRequests = async () => {
    try {
      const res = await fetch("/api/admin/refunds")
      const data = await res.json()
      if (data.success) {
        setRequests(data.data)
      } else {
        toast.error(data.error || "Failed to load refund requests")
      }
    } catch {
      toast.error("Failed to fetch refund requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!window.confirm(`Are you sure you want to mark this request as ${status}?`)) return
    
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Request marked as ${status}`)
        loadRequests()
      } else {
        toast.error(data.error || "Failed to update request")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between border-b border-border/40 pb-6">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-1 font-semibold">
            Management
          </p>
          <h2 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            Refund Requests
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Process customer return and refund applications.
          </p>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-white dark:bg-muted overflow-hidden transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)]">
        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              No refund requests at this time.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Order</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Reason</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${req.orderId}`} className="text-primary hover:underline font-mono">
                      #{req.order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold">{req.user.name || "N/A"}</span>
                      <span className="text-xs text-muted-foreground">{req.user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 truncate max-w-[200px]" title={req.reason}>
                    {req.reason}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold">
                    {formatPrice(req.order.total)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase
                      ${req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 
                        req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 
                        'bg-red-500/10 text-red-500 border border-red-500/30'}`}
                    >
                      {req.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {req.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                      {req.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
