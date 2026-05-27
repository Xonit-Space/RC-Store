"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { RefreshCw, Search, ShoppingBag } from "lucide-react"
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
        <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">Loading Transactions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="pb-6 border-b border-border/40">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
          Fulfillment
        </p>
        <h2 className="font-sans text-3xl font-light text-foreground leading-none">
          Order Management
        </h2>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search by Order # or Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 w-full bg-transparent border border-border/40 rounded-none focus:border-foreground focus:outline-none transition-colors placeholder:uppercase placeholder:tracking-wider placeholder:text-[10px]"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div className="border border-border/40 p-12 text-center bg-background">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">No transactions recorded</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => (
            <div key={o.id} className="border border-border/40 bg-background transition-colors hover:border-foreground/30">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-muted/5 border-b border-border/40 p-6 gap-6">
                <div>
                  <p className="font-sans text-lg text-foreground mb-1">
                    Order #{o.orderNumber}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    {o.user.name || o.user.email} <span className="mx-2 text-border">|</span> {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto">
                  <span className="text-sm font-bold text-foreground">Rs. {o.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                    className="h-10 border border-border/40 bg-transparent text-[10px] font-bold text-foreground px-3 outline-none uppercase tracking-widest cursor-pointer focus:border-foreground ml-auto md:ml-0"
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

              <div className="p-6">
                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-4">Order Manifest</div>
                <div className="space-y-3">
                  {o.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm text-foreground">
                      <p className="line-clamp-1">{item.variant?.product?.name || "Product SKU variant"}</p>
                      <p className="text-muted-foreground shrink-0 ml-4 font-bold">
                        {item.quantity} <span className="font-normal text-xs mx-1">×</span> Rs. {item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
