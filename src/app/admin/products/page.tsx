"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Search, Package, RefreshCw, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { adminDeleteProduct } from "@/actions/product"
import { getAddons } from "@/actions/addons"
import { getCategories } from "@/actions/categories"
import { useAdminProducts } from "@/hooks/use-admin-data"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { FullProductEditModal } from "@/components/admin/product/full-product-edit-modal"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

function totalStock(product: any): number {
  return (product.variants || []).reduce(
    (sum: number, v: any) => sum + (v.inventory?.quantity ?? 0),
    0
  )
}

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0)
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-red-500">
        <XCircle className="w-3 h-3" /> Out of Stock
      </span>
    )
  if (qty < 10)
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-500">
        <AlertTriangle className="w-3 h-3" /> Low: {qty} left
      </span>
    )
  return (
    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-500">
      <CheckCircle2 className="w-3 h-3" /> In Stock: {qty}
    </span>
  )
}

export default function AdminProductsPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading: isLoadingProducts } = useAdminProducts(page, limit, debouncedSearch)
  const { data: dbCategories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["admin", "categories-data"],
    queryFn: () => getCategories()
  })
  const { data: availableAddons = [] } = useQuery({
    queryKey: ["admin", "addons-data"],
    queryFn: () => getAddons()
  })

  const products = data?.products || []
  const pagination = data?.pagination || { total: 0, pages: 0, page: 1, limit }
  const loading = isLoadingProducts || isLoadingCategories

  // ─── Modal state ────────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openCreateModal = () => {
    setEditingId("")
    setIsOpen(true)
  }

  const openEditModal = (product: any) => {
    setEditingId(product.id)
    setIsOpen(true)
  }

  // ─── Delete handler ────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteId) return
    const productId = deleteId
    setDeleteId(null)
    try {
      const res = await adminDeleteProduct(session?.user?.id || "", productId)
      if (res.success) {
        toast.success("Product archived successfully")
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
      } else {
        toast.error(res.error || "Failed to archive product")
      }
    } catch {
      toast.error("Failed to archive product")
    }
  }

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">
          Loading Catalog...
        </span>
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 font-sans">
      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <h2 className="font-sans text-2xl font-semibold text-foreground leading-none">
            Product Catalog
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination.total} RC products
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="h-10 px-5 rounded-md bg-foreground text-background font-semibold text-xs tracking-wide hover:bg-foreground/90 transition-colors flex items-center gap-2"
        >
          <Plus className="h-3.5 w-3.5" /> Add Product
        </Button>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search RC products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 bg-white dark:bg-background border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors placeholder:uppercase placeholder:tracking-wider placeholder:text-[10px]"
        />
      </div>

      {/* ── Product grid ── */}
      {products.length === 0 ? (
        <div className="border border-border/40 p-12 text-center bg-background">
          <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            No RC products found
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">
            Click &ldquo;Add Product&rdquo; to create your first RC product
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {products.map((p: any) => {
            const stock = totalStock(p)
            const thumb = p.images?.[0]?.url || null
            return (
              <div
                key={p.id}
                className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col group transition-colors hover:border-foreground/30"
              >
                <div className="p-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 shrink-0 border border-border/30 overflow-hidden bg-muted/10 relative">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={p.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-sans text-base font-light text-foreground line-clamp-1 leading-tight">
                        {p.name}
                      </h3>
                      <span className="text-sm font-bold text-foreground whitespace-nowrap shrink-0">
                        {Number(p.price).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
                      </span>
                    </div>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                      {p.category?.name}
                      {p.brand?.name ? ` · ${p.brand.name}` : ""}
                    </p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 leading-relaxed">
                      {p.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <StockBadge qty={stock} />
                      <span
                        className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 ${
                          p.isActive
                            ? "text-emerald-500 bg-emerald-500/10"
                            : "text-muted-foreground bg-muted/20"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/40 px-4 py-3 flex justify-between items-center bg-muted/5 gap-2">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                    {p.variants?.length || 0} Variant{(p.variants?.length || 0) !== 1 ? "s" : ""}
                    {p.images?.length > 0 ? ` · ${p.images.length} Photo` : ""}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => openEditModal(p)}
                      className="h-8 rounded-none border-border/40 text-[9px] uppercase tracking-widest font-bold"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Options
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteId(p.id)}
                      className="h-8 rounded-none border-border/40 text-[9px] uppercase tracking-widest font-bold text-red-500 hover:text-red-700 hover:border-red-500/40"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Archive
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 pt-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 rounded-none border-border/40"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex items-center px-3 text-[10px] font-bold uppercase tracking-widest border border-border/40">
              {pagination.page} / {pagination.pages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 rounded-none border-border/40"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Full Product Edit Modal ── */}
      {isOpen && (
        <FullProductEditModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          initialProductId={editingId}
          dbCategories={dbCategories}
          availableAddons={availableAddons}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Product?</AlertDialogTitle>
            <AlertDialogDescription>Archive this product? It will be hidden from the store but data is preserved.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
