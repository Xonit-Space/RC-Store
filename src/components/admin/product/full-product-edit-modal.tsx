"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, X, Edit, Upload, ImagePlus, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { 
  adminCreateProduct, adminUpdateProduct,
  adminAddVariant, adminUpdateVariant,
  adminAddProductVideo, adminDeleteProductVideo, 
  adminAddProductDocument, adminDeleteProductDocument,
  adminAddProductFeatureBlock, adminDeleteProductFeatureBlock,
  adminAddRelatedProduct, adminDeleteRelatedProduct
} from "@/actions/product"
import { linkProductToModel } from "@/actions/part-finder"
import { useAdminProduct, useAdminProducts } from "@/hooks/use-admin-data"

import { VariantsTab } from "./tabs/variants-tab"
import { MediaTab } from "./tabs/media-tab"
import { FeaturesTab } from "./tabs/features-tab"
import { RelatedTab } from "./tabs/related-tab"
import { AddonsTab } from "./tabs/addons-tab"
import { CompatibilityTab } from "./tabs/compatibility-tab"

const RC_CATEGORIES = [
  "RC Cars", "RC Trucks", "RC Buggies", "RC Crawlers", "RC Drift Cars",
  "RC Boats", "RC Planes", "Batteries & Chargers", "Remote Controllers",
  "Tires & Wheels", "Body Parts & Shells", "Motors & ESC",
  "Suspension & Chassis", "Spare Parts", "Tools & Accessories", "Other"
]

const RC_SCALES = ["1:5", "1:8", "1:10", "1:12", "1:14", "1:16", "1:18", "1:24", "1:28", "N/A"]

export function FullProductEditModal({
  isOpen,
  onClose,
  initialProductId = "",
  dbCategories = [],
  availableAddons = [],
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  initialProductId?: string
  dbCategories?: any[]
  availableAddons?: any[]
  onSuccess?: () => void
}) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("basic")
  
  // Base Product State
  const [productId, setProductId] = useState(initialProductId)
  const isEditMode = !!productId

  // We load product data if in edit mode
  const { data: product, isLoading: isLoadingProduct } = useAdminProduct(productId)
  
  // Basic Form fields
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [stock, setStock] = useState("0")
  const [rcCategory, setRcCategory] = useState(RC_CATEGORIES[0])
  const [categoryId, setCategoryId] = useState("")
  const [brandName, setBrandName] = useState("")
  const [scale, setScale] = useState("N/A")
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [featuresText, setFeaturesText] = useState("")
  const [includedItemsText, setIncludedItemsText] = useState("")
  const [requiredItemsText, setRequiredItemsText] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate basic form when product loads
  useEffect(() => {
    if (product) {
      setName(product.name || "")
      setDescription(product.description || "")
      setPrice(product.price ? product.price.toString() : "")
      setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : "")
      setRcCategory(product.category?.name || RC_CATEGORIES[0])
      setCategoryId(product.categoryId || "")
      setBrandName(product.brand?.name || "")
      setScale(product.scale || "N/A")
      setIsFeatured(product.isFeatured || false)
      setIsActive(product.isActive ?? true)
      
      const totalStock = product.variants?.reduce((acc: number, v: any) => acc + (v.inventory?.quantity || 0), 0) || 0
      setStock(totalStock.toString())

      setFeaturesText(product.features ? product.features.join("\n") : "")
      setIncludedItemsText(product.includedItems ? product.includedItems.join("\n") : "")
      setRequiredItemsText(product.requiredItems ? product.requiredItems.join("\n") : "")
      setNotes(product.notes || "")
    } else if (!initialProductId) {
      // Reset if new
      setName("")
      setDescription("")
      setPrice("")
      setOriginalPrice("")
      setRcCategory(RC_CATEGORIES[0])
      setCategoryId("")
      setBrandName("")
      setScale("N/A")
      setIsFeatured(false)
      setIsActive(true)
      setStock("0")
      setFeaturesText("")
      setIncludedItemsText("")
      setRequiredItemsText("")
      setNotes("")
    }
  }, [product, initialProductId])

  const handleSaveBasic = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      name, description, price: Number(price), 
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stock: Number(stock),
      categoryId, brandName, scale, isFeatured, isActive,
      features: featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
      includedItems: includedItemsText.split("\n").map((i) => i.trim()).filter(Boolean),
      requiredItems: requiredItemsText.split("\n").map((i) => i.trim()).filter(Boolean),
      notes
    }

    try {
      if (isEditMode) {
        const res = await adminUpdateProduct(session?.user?.id || "", productId, payload)
        if (res.success) {
          toast.success("Product updated successfully")
          queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
          if (onSuccess) onSuccess()
        } else {
          toast.error(res.error || "Failed to update product")
        }
      } else {
        const res = await adminCreateProduct(session?.user?.id || "", payload)
        if (res.success) {
          toast.success("Product created successfully! You can now add media.")
          setProductId(res.data.id)
          setActiveTab("media")
          if (onSuccess) onSuccess()
        } else {
          toast.error(res.error || "Failed to create product")
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs = [
    { id: "basic", label: "Basic Details" },
    { id: "variants", label: "Variants" },
    { id: "media", label: "Media & Files" },
    { id: "features", label: "Feature Blocks" },
    { id: "related", label: "Related Products" },
    { id: "addons", label: "Addons" },
    { id: "compatibility", label: "Part Finder" },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white dark:bg-background border border-border/40 shadow-2xl transition-all duration-300 relative h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border/40">
          <div>
            <h3 className="font-sans text-2xl font-light text-foreground">
              {isEditMode ? `Edit Product: ${product?.name || "Loading..."}` : "New RC Product"}
            </h3>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">
              {!isEditMode ? "Save basic details first to unlock other tabs" : "Manage all product features"}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border/40 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-xs tracking-widest uppercase font-bold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
          {activeTab === "basic" && (
            <form onSubmit={handleSaveBasic} className="space-y-6 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-12 bg-white dark:bg-background border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Category</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-12 bg-white dark:bg-background border border-border/60 rounded-none text-xs text-foreground px-3 outline-none focus:border-foreground">
                    <option value="">Select Category...</option>
                    {dbCategories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Base Price ($) <span className="text-red-400">*</span></label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="h-12 bg-white dark:bg-background border-border/60 rounded-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Original Price ($) (Optional)</label>
                  <Input type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="h-12 bg-white dark:bg-background border-border/60 rounded-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Base Stock <span className="text-red-400">*</span></label>
                  <Input type="number" step="1" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required className="h-12 bg-white dark:bg-background border-border/60 rounded-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Brand Name</label>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} className="h-12 bg-white dark:bg-background border-border/60 rounded-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Scale</label>
                  <select value={scale} onChange={(e) => setScale(e.target.value)} className="w-full h-12 bg-white dark:bg-background border border-border/60 rounded-none text-xs px-3">
                    {RC_SCALES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-24 p-3 bg-white dark:bg-background border border-border/60 rounded-none focus:outline-none focus:border-foreground text-sm" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Features (One per line)</label>
                  <textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} className="w-full h-24 p-3 bg-white dark:bg-background border border-border/60 rounded-none focus:outline-none focus:border-foreground text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Included (One per line)</label>
                  <textarea value={includedItemsText} onChange={(e) => setIncludedItemsText(e.target.value)} className="w-full h-24 p-3 bg-white dark:bg-background border border-border/60 rounded-none focus:outline-none focus:border-foreground text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Required (One per line)</label>
                  <textarea value={requiredItemsText} onChange={(e) => setRequiredItemsText(e.target.value)} className="w-full h-24 p-3 bg-white dark:bg-background border border-border/60 rounded-none focus:outline-none focus:border-foreground text-sm" />
                </div>
              </div>

              <div className="flex gap-6 pt-4 border-t border-border/40">
                <label className="flex items-center gap-2 text-xs tracking-widest uppercase font-bold cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded-none bg-transparent" />
                  Product Active
                </label>
                <label className="flex items-center gap-2 text-xs tracking-widest uppercase font-bold cursor-pointer">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded-none bg-transparent" />
                  Featured Product
                </label>
              </div>

              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={isSubmitting} className="h-12 px-8 rounded-none bg-foreground text-background font-bold uppercase tracking-widest">
                  {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Create & Add Media"}
                </Button>
              </div>
            </form>
          )}

          {activeTab === "variants" && product && (
            <VariantsTab product={product} />
          )}

          {activeTab === "media" && product && (
            <MediaTab product={product} />
          )}

          {activeTab === "features" && product && (
            <FeaturesTab product={product} />
          )}

          {activeTab === "related" && product && (
            <RelatedTab product={product} />
          )}
          {activeTab === "addons" && product && (
            <AddonsTab product={product} availableAddons={availableAddons} />
          )}
          {activeTab === "compatibility" && product && (
            <CompatibilityTab product={product} />
          )}
        </div>
      </div>
    </div>
  )
}
