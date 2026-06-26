"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  RefreshCw, Search, ShoppingBag, ChevronLeft, ChevronRight,
  MapPin, Package, Clock, CheckCircle2, Truck, XCircle, RotateCcw,
  CreditCard, Filter, X
} from "lucide-react"
import { toast } from "sonner"
import { adminUpdateOrderStatus } from "@/actions/order"
import { OrderStatus } from "@prisma/client"
import { useDebounce } from "@/hooks/use-debounce"
import { useAdminOrders } from "@/hooks/use-admin-data"
import { useQueryClient } from "@tanstack/react-query"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING:    { label: "Pending",    color: "text-amber-500",    bg: "bg-amber-500/10",    icon: Clock },
  PAID:       { label: "Paid",       color: "text-blue-500",     bg: "bg-blue-500/10",     icon: CreditCard },
  PROCESSING: { label: "Processing", color: "text-purple-500",   bg: "bg-purple-500/10",   icon: RefreshCw },
  SHIPPED:    { label: "Shipped",    color: "text-indigo-500",   bg: "bg-indigo-500/10",   icon: Truck },
  DELIVERED:  { label: "Delivered",  color: "text-emerald-500",  bg: "bg-emerald-500/10",  icon: CheckCircle2 },
  CANCELLED:  { label: "Cancelled",  color: "text-red-500",      bg: "bg-red-500/10",      icon: XCircle },
  REFUNDED:   { label: "Refunded",   color: "text-zinc-400",     bg: "bg-zinc-500/10",     icon: RotateCcw },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status]
  if (!cfg) return <span className="text-xs text-muted-foreground">{status}</span>
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm ${cfg.color} ${cfg.bg}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

const ALL_STATUSES = ["ALL", ...Object.keys(STATUS_CONFIG)] as const
type FilterStatus = typeof ALL_STATUSES[number]

const PAGE_SIZE = 20

// ─── Inner page (needs useSearchParams inside Suspense) ───────────────────────

function OrdersPageInner() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const currentPage = parseInt(searchParams.get("page") || "1", 10)
  const currentSearch = searchParams.get("search") || ""
  const currentStatus = (searchParams.get("status") || "ALL") as FilterStatus

  const [search, setSearch] = useState(currentSearch)
  const [activeStatus, setActiveStatus] = useState<FilterStatus>(currentStatus)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  const debouncedSearch = useDebounce(search, 400)

  // Sync search + status filter → URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) params.set("search", debouncedSearch)
    else params.delete("search")
    params.set("page", "1")
    router.replace(`${pathname}?${params.toString()}`)
  }, [debouncedSearch]) // eslint-disable-line

  const { data: ordersData, isLoading: loading } = useAdminOrders(currentPage, PAGE_SIZE, debouncedSearch)

  const allOrders: any[] = ordersData?.data || []
  const totalPages = ordersData?.pagination?.totalPages || 1
  const total = ordersData?.pagination?.total || 0

  // Client-side status filter (on top of search)
  const orders = activeStatus === "ALL"
    ? allOrders
    : allOrders.filter((o) => o.status === activeStatus)

  // Count per status from current page
  const statusCounts = allOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const handleStatusChange = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await adminUpdateOrderStatus(session?.user?.id || "", orderId, newStatus)
      if (res.success) {
        toast.success("Order status updated!")
        queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })
      } else {
        toast.error(res.error || "Failed to update status")
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
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">
          Loading Orders...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      {/* ── Header ── */}
      <div className="pb-6 border-b border-border/40 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-sans text-2xl font-semibold text-foreground leading-none">
            Order Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {total.toLocaleString()} total orders
          </p>
        </div>
        {activeStatus !== "ALL" && (
          <button
            onClick={() => setActiveStatus("ALL")}
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border/40 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
          >
            <X className="h-3 w-3" /> Clear filter
          </button>
        )}
      </div>

      {/* ── Status counts bar (clickable) ── */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
          const count = statusCounts[status] || 0
          const Icon = cfg.icon
          const isActive = activeStatus === status
          return (
            <button
              key={status}
              onClick={() => setActiveStatus(isActive ? "ALL" : status as FilterStatus)}
              className={`border p-3 text-center transition-all rounded-md ${
                isActive
                  ? `border-current ${cfg.color} bg-muted/30`
                  : "border-border/30 bg-muted/5 hover:border-border/60"
              }`}
            >
              <Icon className={`w-4 h-4 mx-auto mb-1 ${cfg.color}`} />
              <p className={`text-sm font-bold ${cfg.color}`}>{count}</p>
              <p className="text-[8px] uppercase tracking-widest text-muted-foreground mt-0.5">{cfg.label}</p>
            </button>
          )
        })}
      </div>

      {/* ── Search + filter tabs ── */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 w-full bg-transparent border border-border/40 rounded-none focus:border-foreground focus:outline-none transition-colors placeholder:uppercase placeholder:tracking-wider placeholder:text-[10px] text-sm"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0 mr-1" />
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`h-8 px-3 text-[9px] font-bold uppercase tracking-widest border transition-colors ${
                activeStatus === s
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/40 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {s === "ALL" ? "All" : STATUS_CONFIG[s as OrderStatus]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Orders list ── */}
      {orders.length === 0 ? (
        <div className="border border-border/40 p-12 text-center bg-background">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            No orders {activeStatus !== "ALL" ? `with status ${STATUS_CONFIG[activeStatus as OrderStatus]?.label}` : "found"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <div
              key={o.id}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setSelectedOrder(o)
              }}
              className="border border-border/40 bg-background transition-colors hover:border-foreground/30 cursor-pointer group"
            >
              {/* Order header row */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-muted/5 px-6 py-4 gap-4">
                <div className="flex items-start gap-4">
                  <div>
                    <p className="font-sans text-base font-medium text-foreground group-hover:text-primary transition-colors">
                      Order #{o.orderNumber}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                      {o.user?.name || o.user?.email}
                      <span className="mx-2 text-border">·</span>
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <span className="text-base font-bold text-foreground">
                    {Number(o.total).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
                  </span>

                  <StatusBadge status={o.status} />

                  <button type="button" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors ml-4 md:ml-2">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Order Details Slide Panel ── */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto border-l border-border/40 bg-background/95 backdrop-blur-sm p-0">
          {selectedOrder && (
            <div className="h-full flex flex-col font-sans">
              <div className="p-6 border-b border-border/40 bg-muted/5">
                <SheetHeader>
                  <SheetTitle className="font-sans text-2xl font-light">Order #{selectedOrder.orderNumber}</SheetTitle>
                  <SheetDescription className="text-[10px] uppercase tracking-widest">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </SheetDescription>
                </SheetHeader>
                
                <div className="flex items-center justify-between mt-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Current Status</p>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Update Status</p>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                        setSelectedOrder({ ...selectedOrder, status: e.target.value })
                      }}
                      className="h-9 border border-border/40 bg-background text-[10px] font-bold text-foreground px-2 outline-none uppercase tracking-widest cursor-pointer focus:border-foreground"
                    >
                      {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                        <option key={s} value={s}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 space-y-8">
                {/* Items */}
                <div className="space-y-4">
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-border/40 pb-2">
                    <Package className="w-3.5 h-3.5" /> Order Manifest
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center gap-4 group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 border border-border/30 bg-muted/10 shrink-0 flex items-center justify-center overflow-hidden">
                            {item.variant?.product?.images?.[0] ? (
                              <img src={typeof item.variant.product.images[0] === 'string' ? item.variant.product.images[0] : (item.variant.product.images[0]?.url || "")} alt="" className="w-full h-full object-cover mix-blend-luminosity opacity-80" />
                            ) : (
                              <Package className="w-4 h-4 text-muted-foreground/30" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground line-clamp-1">
                              {item.variant?.product?.name || "RC Product"}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 truncate">
                              {item.variant?.name || "Standard Edition"}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-nowrap shrink-0">
                          <span className="font-bold text-foreground">{item.quantity}</span>
                          {" "}× {Number(item.price).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-4">
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-border/40 pb-2">
                    <MapPin className="w-3.5 h-3.5" /> Fulfillment Details
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Customer</p>
                      <p className="text-sm text-foreground font-medium">{selectedOrder.user?.name || "Guest"}</p>
                      <p className="text-[11px] text-muted-foreground">{selectedOrder.user?.email}</p>
                    </div>
                    
                    {selectedOrder.shippingAddress && (
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Shipping Address</p>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          <p className="text-foreground font-medium">{selectedOrder.shippingAddress.title || "Home"}</p>
                          <p>{selectedOrder.shippingAddress.line1}</p>
                          {selectedOrder.shippingAddress.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                          <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                          <p>{selectedOrder.shippingAddress.country}</p>
                          {selectedOrder.shippingAddress.phone && (
                            <p className="mt-2 font-bold text-foreground bg-muted/10 p-2 inline-block border border-border/40">
                              📞 {selectedOrder.shippingAddress.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-4">
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-border/40 pb-2">
                    <CreditCard className="w-3.5 h-3.5" /> Financial Summary
                  </div>
                  <div className="bg-muted/5 border border-border/40 p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{Number(selectedOrder.subtotal).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>{Number(selectedOrder.shippingCost).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span>{Number(selectedOrder.tax).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</span>
                    </div>
                    {Number(selectedOrder.discount) > 0 && (
                      <div className="flex justify-between text-emerald-500">
                        <span>Discount</span>
                        <span>- {Number(selectedOrder.discount).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-foreground font-bold text-base pt-2 border-t border-border/40 mt-2">
                      <span>Total Paid</span>
                      <span>{Number(selectedOrder.total).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Pagination ── */}
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
    </div>
  )
}

// ─── Exported page (wraps in Suspense for useSearchParams) ────────────────────

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-12 h-64">
          <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">
            Loading Orders...
          </span>
        </div>
      }
    >
      <OrdersPageInner />
    </Suspense>
  )
}
