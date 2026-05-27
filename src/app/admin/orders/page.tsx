"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Search, ShoppingBag, Eye, Calendar, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { adminUpdateOrderStatus } from "@/actions/order"
import { OrderStatus } from "@prisma/client"

export default function AdminOrdersPage() {
  const { data: session } = useSession()

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data || [])
      } else {
        toast.error("Failed to load platform orders")
      }
    } catch (err) {
      toast.error("Failed to execute database fetch")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await adminUpdateOrderStatus(session?.user?.id || "", orderId, newStatus)
      if (res.success) {
        toast.success("Order status updated successfully!")
        await loadOrders()
      } else {
        toast.error(res.error || "Transition update rejected")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  const filteredOrders = orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.user.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-slate-400 mt-2">Loading transactions feed...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-snug">Order Fulfilment Management</h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Track shipping channels and update customer order transitions.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Search by Order # or Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 w-full bg-white border border-slate-200 focus:border-primary rounded-xl text-sm outline-none font-medium transition"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="border border-dashed p-12 text-center rounded-2xl">
          <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-2 animate-pulse" />
          <p className="text-sm font-bold text-slate-700">No transactions recorded yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => (
            <Card key={o.id} className="border border-slate-100 rounded-2xl shadow-sm bg-card overflow-hidden transition hover:border-slate-200">
              <div className="flex flex-col md:flex-row justify-between bg-slate-50/50 border-b border-slate-100 p-4 gap-4">
                <div>
                  <p className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                    ORDER #{o.orderNumber}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    Customer: {o.user.name || o.user.email} | {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-extrabold text-slate-800">Rs. {o.total.toFixed(2)}</span>
                  
                  {/* Status Dropdown conforming to state transitions */}
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                    className="h-8 border border-slate-200 rounded-lg text-[10px] font-extrabold text-slate-600 px-2 outline-none uppercase bg-white cursor-pointer"
                  >
                    <option value={OrderStatus.PENDING}>Pending</option>
                    <option value={OrderStatus.PAID}>Paid</option>
                    <option value={OrderStatus.PROCESSING}>Processing</option>
                    <option value={OrderStatus.SHIPPED}>Shipped</option>
                    <option value={OrderStatus.DELIVERED}>Delivered</option>
                    <option value={OrderStatus.CANCELLED}>Cancelled</option>
                    <option value={OrderStatus.REFUNDED}>Refunded</option>
                  </select>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order Items:</div>
                {o.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-xs font-semibold text-slate-600 py-1 border-b last:border-0 border-slate-100">
                    <p className="line-clamp-1">{item.variant?.product?.name || "Product SKU variant"}</p>
                    <p className="text-slate-400 shrink-0 ml-4">
                      Qty: {item.quantity} × Rs. {item.price}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
