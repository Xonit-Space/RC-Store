"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Search, Package, RefreshCw, X, Edit, ChevronLeft, ChevronRight, Layers } from "lucide-react"
import { toast } from "sonner"
import { adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from "@/actions/product"
import { useAdminProducts, useAdminCategories } from "@/hooks/use-admin-data"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

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
  const { data: categories = [], isLoading: isLoadingCategories } = useAdminCategories()
  
  const products = data?.products || []
  const pagination = data?.pagination || { total: 0, pages: 0, page: 1, limit }
  const loading = isLoadingProducts || isLoadingCategories

  // Form state
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState("")
  
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [gender, setGender] = useState<"MEN" | "WOMEN" | "KIDS" | "UNISEX">("UNISEX")
  const [categoryId, setCategoryId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openCreateModal = () => {
    setIsEditMode(false)
    setEditingId("")
    setName("")
    setDescription("")
    setPrice("")
    setOriginalPrice("")
    setGender("UNISEX")
    setCategoryId(categories.length > 0 ? categories[0].id : "")
    setIsOpen(true)
  }

  const openEditModal = (product: any) => {
    setIsEditMode(true)
    setEditingId(product.id)
    setName(product.name)
    setDescription(product.description || "")
    setPrice(product.price.toString())
    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : "")
    setGender(product.gender || "UNISEX")
    setCategoryId(product.categoryId || "")
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) {
      toast.error("Name and price are required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        gender,
        categoryId,
        attributes: [],
        isActive: true,
        isFeatured: false,
      }

      let res
      if (isEditMode) {
        res = await adminUpdateProduct(session?.user?.id || "", editingId, payload)
      } else {
        res = await adminCreateProduct(session?.user?.id || "", payload)
      }

      if (res.success) {
        toast.success(`Successfully ${isEditMode ? 'updated' : 'created'} product!`)
        setIsOpen(false)
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
      } else {
        toast.error(res.error || `Failed to ${isEditMode ? 'update' : 'create'} product`)
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to archive this product? This will soft-delete the record.")) return

    try {
      const res = await adminDeleteProduct(session?.user?.id || "", productId)
      if (res.success) {
        toast.success("Product successfully archived!")
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
      } else {
        toast.error(res.error || "Failed to delete product")
      }
    } catch (err) {
      toast.error("Failed to delete product")
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">Loading Catalog...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
            Inventory Management
          </p>
          <h2 className="font-sans text-3xl font-light text-foreground leading-none">
            Product Catalog
          </h2>
        </div>
        <Button
          onClick={openCreateModal}
          className="h-12 px-6 rounded-none bg-foreground text-background font-bold text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products globally..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 bg-transparent border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors placeholder:uppercase placeholder:tracking-wider placeholder:text-[10px]"
        />
      </div>

      {products.length === 0 ? (
        <div className="border border-border/40 p-12 text-center bg-background">
          <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {products.map((p: any) => (
            <div key={p.id} className="border border-border/40 bg-background flex flex-col group transition-colors hover:border-foreground/30">
              <div className="p-6 flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-sans text-lg font-light text-foreground line-clamp-1 leading-tight">{p.name}</h3>
                    <span className="text-sm font-bold text-foreground whitespace-nowrap">Rs. {Number(p.price).toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.category?.name} • {p.brand?.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-2">{p.description}</p>
                </div>
              </div>

              <div className="border-t border-border/40 p-4 flex justify-between items-center bg-muted/5 gap-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  {p.variants?.length || 0} Variants
                </span>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/products/${p.id}`}>
                    <Button
                      variant="outline"
                      className="h-8 rounded-none border-border/40 text-[9px] uppercase tracking-widest font-bold"
                    >
                      <Layers className="w-3.5 h-3.5 mr-2" /> Variants
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => openEditModal(p)}
                    className="h-8 rounded-none border-border/40 text-[9px] uppercase tracking-widest font-bold"
                  >
                    <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(p.id)}
                    className="h-8 rounded-none border-border/40 text-[9px] uppercase tracking-widest font-bold text-terracotta hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Archive
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 pt-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="h-8 rounded-none border-border/40"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="h-8 rounded-none border-border/40"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-background border border-border shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-sans text-2xl font-light text-foreground mb-2">
              {isEditMode ? "Edit Product" : "New Product"}
            </h3>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-8">Define catalog item parameters</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Product Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[100px] p-3 bg-transparent border border-border/60 rounded-none focus-visible:outline-none focus-visible:border-foreground text-sm resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Price (Rs.)</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Original Price (Rs.)</label>
                  <Input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Optional (for discounts)"
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-12 bg-transparent border border-border/60 rounded-none w-full text-xs text-foreground px-3 outline-none focus:border-foreground"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Target Group</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="h-12 bg-transparent border border-border/60 rounded-none w-full text-xs text-foreground px-3 outline-none focus:border-foreground"
                  >
                    <option value="UNISEX">Unisex</option>
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                    <option value="KIDS">Kids</option>
                  </select>
                </div>
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
                  {isSubmitting ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
