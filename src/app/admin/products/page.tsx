"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus, Trash2, Search, Package, RefreshCw, X, Edit,
  ChevronLeft, ChevronRight, Layers, Upload, ImagePlus,
  AlertTriangle, CheckCircle2, XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from "@/actions/product"
import { getAddons, getProductAddons, assignAddonsToProduct } from "@/actions/addons"
import { getCategories } from "@/actions/categories"
import { useAdminProducts } from "@/hooks/use-admin-data"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import Link from "next/link"
import Image from "next/image"

// ─── RC-specific constants ──────────────────────────────────────────────────

const RC_CATEGORIES = [
  "RC Cars",
  "RC Trucks",
  "RC Buggies",
  "RC Crawlers",
  "RC Drift Cars",
  "RC Boats",
  "RC Planes",
  "Batteries & Chargers",
  "Remote Controllers",
  "Tires & Wheels",
  "Body Parts & Shells",
  "Motors & ESC",
  "Suspension & Chassis",
  "Spare Parts",
  "Tools & Accessories",
  "Other",
]

const RC_SCALES = ["1:5", "1:8", "1:10", "1:12", "1:14", "1:16", "1:18", "1:24", "1:28", "N/A"]

// ─── Stock badge helper ──────────────────────────────────────────────────────

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

// ─── Image uploader slot ─────────────────────────────────────────────────────

interface ImageSlot {
  id: string         // temp UUID or DB image ID
  url: string        // preview URL (object URL or cloudinary URL)
  file?: File        // only set when a new local file was selected
  uploading?: boolean
  saved?: boolean    // true = already persisted to DB
}

function ImageSlots({
  slots,
  onChange,
  disabled,
}: {
  slots: ImageSlot[]
  onChange: (slots: ImageSlot[]) => void
  disabled: boolean
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const MAX = 5

  const handleFile = (index: number, file: File) => {
    const preview = URL.createObjectURL(file)
    const newSlots = [...slots]
    if (index < newSlots.length) {
      newSlots[index] = { ...newSlots[index], url: preview, file, saved: false }
    } else {
      newSlots.push({ id: `temp-${Date.now()}-${index}`, url: preview, file, saved: false })
    }
    onChange(newSlots)
  }

  const handleRemove = (index: number) => {
    const newSlots = slots.filter((_, i) => i !== index)
    onChange(newSlots)
  }

  const emptySlots = MAX - slots.length
  const displaySlots = [...slots, ...Array(Math.max(0, emptySlots)).fill(null)]

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
        Product Images <span className="text-muted-foreground font-normal">(up to 5)</span>
      </label>
      <div className="grid grid-cols-5 gap-2">
        {displaySlots.map((slot: ImageSlot | null, i) => (
          <div
            key={i}
            className={`relative aspect-square border-2 border-dashed transition-all group
              ${slot ? "border-border/60 bg-muted/5" : "border-border/30 hover:border-foreground/40 cursor-pointer bg-muted/5"}
            `}
          >
            {slot ? (
              <>
                <Image
                  src={slot.url}
                  alt={`Product image ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={slot.url.startsWith("blob:")}
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                {slot.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <RefreshCw className="w-4 h-4 animate-spin text-foreground" />
                  </div>
                )}
                {i === 0 && (
                  <div className="absolute bottom-1 left-1 bg-foreground/80 text-background text-[8px] px-1 py-0.5 uppercase tracking-wider">
                    Main
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRefs.current[i]?.click()}
                className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors disabled:opacity-40"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-[8px] uppercase tracking-wider">{i + 1}</span>
              </button>
            )}
            <input
              ref={(el) => { inputRefs.current[i] = el }}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              disabled={disabled}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(i, file)
                e.target.value = ""
              }}
            />
          </div>
        ))}
      </div>
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
        JPG, PNG or WEBP · Max 5MB per image · First image is the main thumbnail
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

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
  const { data: availableAddons = [], isLoading: isLoadingAddons } = useQuery({
    queryKey: ["admin", "addons-data"],
    queryFn: () => getAddons()
  })

  const products = data?.products || []
  const pagination = data?.pagination || { total: 0, pages: 0, page: 1, limit }
  const loading = isLoadingProducts || isLoadingCategories

  // ─── Form state ────────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState("")

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [rcCategory, setRcCategory] = useState(RC_CATEGORIES[0])
  const [categoryId, setCategoryId] = useState("")
  const [brandName, setBrandName] = useState("")
  const [scale, setScale] = useState("N/A")
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([])
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ─── Upload images to Cloudinary & save to DB ──────────────────────────────
  const uploadPendingImages = useCallback(async (productId: string): Promise<void> => {
    for (let i = 0; i < imageSlots.length; i++) {
      const slot = imageSlots[i]
      if (slot.saved || !slot.file) continue

      // Mark slot as uploading
      setImageSlots((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, uploading: true } : s))
      )

      try {
        const fd = new FormData()
        fd.append("file", slot.file)
        const uploadRes = await fetch("/api/admin/products/upload", { method: "POST", body: fd })
        const uploadData = await uploadRes.json()

        if (!uploadData.success) throw new Error(uploadData.error || "Upload failed")

        // Save image URL to DB
        await fetch(`/api/admin/products/${productId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: uploadData.url, sortOrder: i, isFeatured: i === 0 }),
        })

        setImageSlots((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, url: uploadData.url, uploading: false, saved: true, file: undefined } : s
          )
        )
      } catch (err: any) {
        setImageSlots((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, uploading: false } : s))
        )
        toast.error(`Image ${i + 1} upload failed: ${err.message}`)
      }
    }
  }, [imageSlots])

  // ─── Load existing images when editing ────────────────────────────────────
  const loadProductImages = useCallback(async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`)
      const json = await res.json()
      if (json.success && json.data?.length) {
        setImageSlots(
          json.data.map((img: any) => ({
            id: img.id,
            url: img.url,
            saved: true,
          }))
        )
      }
    } catch {
      // silently fail
    }
  }, [])

  // ─── Modal helpers ─────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setIsEditMode(false)
    setEditingId("")
    setName("")
    setDescription("")
    setPrice("")
    setOriginalPrice("")
    setRcCategory(RC_CATEGORIES[0])
    setCategoryId(dbCategories.length > 0 ? dbCategories[0].id : "")
    setBrandName("")
    setScale("N/A")
    setIsFeatured(false)
    setIsActive(true)
    setImageSlots([])
    setSelectedAddonIds([])
    setIsOpen(true)
  }

  const openEditModal = async (product: any) => {
    setIsEditMode(true)
    setEditingId(product.id)
    setName(product.name)
    setDescription(product.description || "")
    setPrice(product.price.toString())
    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : "")
    setRcCategory(product.category?.name || RC_CATEGORIES[0])
    setCategoryId(product.categoryId || "")
    setBrandName(product.brand?.name || "")
    setScale("N/A")
    setIsFeatured(product.isFeatured || false)
    setIsActive(product.isActive !== false)
    setImageSlots([])
    setSelectedAddonIds([])
    setIsOpen(true)
    await loadProductImages(product.id)
    try {
      const pAddons = await getProductAddons(product.id)
      setSelectedAddonIds(pAddons.map(a => a.id))
    } catch {
      // Ignore
    }
  }

  // ─── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) {
      toast.error("Product name and price are required")
      return
    }

    setIsSubmitting(true)
    try {
      // Find or use first available category ID from DB for the selected RC category
      const resolvedCategoryId = categoryId || (dbCategories.length > 0 ? dbCategories[0].id : "")

      const payload = {
        name,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        gender: "UNISEX" as const,
        categoryId: resolvedCategoryId,
        attributes: [
          { name: "RC Category", value: rcCategory },
          { name: "Scale", value: scale },
          ...(brandName ? [{ name: "Brand", value: brandName }] : []),
        ],
        isActive,
        isFeatured,
      }

      let res
      if (isEditMode) {
        res = await adminUpdateProduct(session?.user?.id || "", editingId, payload)
      } else {
        res = await adminCreateProduct(session?.user?.id || "", payload)
      }

      if (res.success) {
        const productId = isEditMode ? editingId : (res.data as any)?.id
        if (productId) {
          await uploadPendingImages(productId)
          await assignAddonsToProduct(productId, selectedAddonIds)
        }
        toast.success(`Product ${isEditMode ? "updated" : "created"} successfully!`)
        setIsOpen(false)
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
      } else {
        toast.error(res.error || `Failed to ${isEditMode ? "update" : "create"} product`)
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Delete handler ────────────────────────────────────────────────────────
  const handleDelete = async (productId: string) => {
    if (!confirm("Archive this product? It will be hidden from the store but data is preserved.")) return
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
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
            Inventory Management
          </p>
          <h2 className="font-sans text-3xl font-light text-foreground leading-none">
            Product Catalog
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
            {pagination.total} RC products
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="h-12 px-6 rounded-none bg-foreground text-background font-bold text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search RC products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 bg-transparent border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors placeholder:uppercase placeholder:tracking-wider placeholder:text-[10px]"
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
                className="border border-border/40 bg-background flex flex-col group transition-colors hover:border-foreground/30"
              >
                <div className="p-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 shrink-0 border border-border/30 overflow-hidden bg-muted/10 relative">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={p.name}
                        fill
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
                        Rs. {Number(p.price).toFixed(2)}
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
                    <Link href={`/admin/products/${p.id}`}>
                      <Button
                        variant="outline"
                        className="h-8 rounded-none border-border/40 text-[9px] uppercase tracking-widest font-bold"
                      >
                        <Layers className="w-3.5 h-3.5 mr-1.5" /> Variants
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => openEditModal(p)}
                      className="h-8 rounded-none border-border/40 text-[9px] uppercase tracking-widest font-bold"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(p.id)}
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

      {/* ── Add / Edit Modal ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-background border border-border shadow-2xl relative max-h-[92vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-start justify-between p-8 pb-4 border-b border-border/40">
              <div>
                <h3 className="font-sans text-2xl font-light text-foreground">
                  {isEditMode ? "Edit RC Product" : "New RC Product"}
                </h3>
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">
                  Define product parameters for your RC store
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="overflow-y-auto flex-1 p-8">
              <form onSubmit={handleSubmit} className="space-y-6" id="product-form">
                {/* Product Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Traxxas Slash 4x4 1:10"
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the product, features, compatibility..."
                    className="w-full min-h-[80px] p-3 bg-transparent border border-border/60 rounded-none focus:outline-none focus:border-foreground text-sm resize-y placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Price row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                      Price (Rs.) <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                      Original Price (Rs.)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="Optional (for sale badge)"
                      className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                    />
                  </div>
                </div>

                {/* RC Category + Scale */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                      RC Category
                    </label>
                    <select
                      value={rcCategory}
                      onChange={(e) => setRcCategory(e.target.value)}
                      className="h-12 bg-background border border-border/60 rounded-none w-full text-xs text-foreground px-3 outline-none focus:border-foreground"
                    >
                      {RC_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                      Scale
                    </label>
                    <select
                      value={scale}
                      onChange={(e) => setScale(e.target.value)}
                      className="h-12 bg-background border border-border/60 rounded-none w-full text-xs text-foreground px-3 outline-none focus:border-foreground"
                    >
                      {RC_SCALES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Brand + DB Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                      Brand
                    </label>
                    <Input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Traxxas, Tamiya, HPI"
                      className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                      Store Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="h-12 bg-background border border-border/60 rounded-none w-full text-xs text-foreground px-3 outline-none focus:border-foreground"
                    >
                      <option value="">Select store category</option>
                      {dbCategories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => setIsActive(!isActive)}
                      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${isActive ? "bg-emerald-500" : "bg-muted"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                      Active (visible in store)
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => setIsFeatured(!isFeatured)}
                      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${isFeatured ? "bg-amber-500" : "bg-muted"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isFeatured ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                      Featured Product
                    </span>
                  </label>
                </div>

                {/* Addons Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                    Product Addons
                  </label>
                  <div className="border border-border/60 p-4 max-h-48 overflow-y-auto space-y-2 bg-muted/5">
                    {availableAddons.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground">No addons available.</p>
                    ) : (
                      availableAddons.map((addon: any) => (
                        <label key={addon.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedAddonIds.includes(addon.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedAddonIds([...selectedAddonIds, addon.id])
                              else setSelectedAddonIds(selectedAddonIds.filter(id => id !== addon.id))
                            }}
                            className="w-4 h-4 rounded-sm border-border bg-transparent text-foreground focus:ring-0 focus:ring-offset-0"
                          />
                          <span className="text-xs text-foreground font-medium">
                            {addon.name} <span className="text-muted-foreground">(Rs. {Number(addon.price).toFixed(2)})</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* 5-image uploader */}
                <ImageSlots
                  slots={imageSlots}
                  onChange={setImageSlots}
                  disabled={isSubmitting}
                />
              </form>
            </div>

            {/* Modal footer */}
            <div className="flex gap-4 justify-end px-8 py-5 border-t border-border/40 bg-muted/5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="h-12 rounded-none border-border/60 text-foreground text-xs font-bold uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="product-form"
                disabled={isSubmitting}
                className="h-12 rounded-none bg-foreground text-background text-xs font-bold uppercase tracking-widest px-8 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    {isEditMode ? "Update Product" : "Save Product"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
