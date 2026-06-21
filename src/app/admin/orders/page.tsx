"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { RefreshCw, Search, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { adminUpdateOrderStatus } from "@/actions/order"
import { OrderStatus } from "@prisma/client"
import { useDebounce } from "@/hooks/use-debounce"
import { useAdminOrders } from "@/hooks/use-admin-data"
import { useQueryClient } from "@tanstack/react-query"

const PAGE_SIZE = 20

export default function AdminOrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentPage = parseInt(searchParams.get("page") || "1", 10)
  const currentSearch = searchParams.get("search") || ""
  const [search, setSearch] = useState(currentSearch)
  const queryClient = useQueryClient()

  // Phase 9: Debounce the search input before URL navigation
  const debouncedSearch = useDebounce(search, 400)

  // Phase 9: Sync debounced search → URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) {
      params.set("search", debouncedSearch)
    } else {
      params.delete("search")
    }
    params.set("page", "1")
    router.replace(`${pathname}?${params.toString()}`)
  }, [debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: ordersData, isLoading: loading, refetch } = useAdminOrders(currentPage, PAGE_SIZE, debouncedSearch)

  const orders = ordersData?.orders || []
  const totalPages = ordersData?.totalPages || 1
  const total = ordersData?.total || 0

  const handleStatusChange = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await adminUpdateOrderStatus(session?.user?.id || "", orderId, newStatus)
      if (res.success) {
        toast.success("Order status updated successfully!")
        queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })
      } else {
        toast.error(res.error || "Transition update rejected")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }, [session?.user?.id, queryClient])

  const navigatePage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

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
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
          {total.toLocaleString()} total orders
        </p>
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

      {orders.length === 0 ? (
        <div className="border border-border/40 p-12 text-center bg-background">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">No transactions recorded</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((o: any) => (
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

          {/* Phase 9: Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigatePage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-2 px-4 py-2 border border-border/40 text-[10px] uppercase tracking-widest font-bold text-foreground disabled:opacity-30 hover:border-foreground transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" /> Prev
                </button>
                <button
                  onClick={() => navigatePage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-2 px-4 py-2 border border-border/40 text-[10px] uppercase tracking-widest font-bold text-foreground disabled:opacity-30 hover:border-foreground transition-colors"
                >
                  Next <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
