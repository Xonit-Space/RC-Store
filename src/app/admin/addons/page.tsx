"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit, X, RefreshCw, PackagePlus } from "lucide-react"
import { toast } from "sonner"
import { getAddons, createAddon, updateAddon, deleteAddon, assignAddonToProducts, getAddonProducts } from "@/actions/addons"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAdminProducts } from "@/hooks/use-admin-data"

export default function AdminAddonsPage() {
  const queryClient = useQueryClient()

  const { data: addons = [], isLoading } = useQuery({
    queryKey: ["admin", "addons-data"],
    queryFn: () => getAddons()
  })

  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState("")

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [currentImage, setCurrentImage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Assign Products State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assigningAddonId, setAssigningAddonId] = useState("")
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [isAssigning, setIsAssigning] = useState(false)

  const { data: allProductsData } = useAdminProducts(1, 1000)
  const allProducts = allProductsData?.products || []

  const openCreateModal = () => {
    setIsEditMode(false)
    setEditingId("")
    setName("")
    setSlug("")
    setDescription("")
    setPrice("")
    setCurrentImage("")
    setImageFile(null)
    setIsActive(true)
    setIsOpen(true)
  }

  const openEditModal = (addon: any) => {
    setIsEditMode(true)
    setEditingId(addon.id)
    setName(addon.name)
    setSlug(addon.slug)
    setDescription(addon.description || "")
    setCurrentImage(addon.image || "")
    setImageFile(null)
    setPrice(addon.price.toString())
    setIsActive(addon.isActive)
    setIsOpen(true)
  }

  const openAssignModal = async (addon: any) => {
    setAssigningAddonId(addon.id)
    setSelectedProductIds([])
    setIsAssignModalOpen(true)
    try {
      const pIds = await getAddonProducts(addon.id)
      setSelectedProductIds(pIds)
    } catch {
      toast.error("Failed to load assigned products")
    }
  }

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAssigning(true)
    try {
      const res = await assignAddonToProducts(assigningAddonId, selectedProductIds)
      if (res.success) {
        toast.success("Products assigned successfully!")
        setIsAssignModalOpen(false)
      } else {
        toast.error(res.error || "Failed to assign products")
      }
    } catch {
      toast.error("Failed to assign products")
    } finally {
      setIsAssigning(false)
    }
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !slug || !price) {
      toast.error("Name, Slug, and Price are required")
      return
    }

    setIsSubmitting(true)
    try {
      let finalImgUrl = currentImage
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        formData.append("folder", "rc-store/addons")
        const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData })
        const uploadData = await uploadRes.json()
        if (!uploadData.success) throw new Error(uploadData.error)
        finalImgUrl = uploadData.url
      }

      const payload = {
        name,
        slug,
        description,
        image: finalImgUrl || null,
        price: parseFloat(price),
        isActive
      }

      let res
      if (isEditMode) {
        res = await updateAddon(editingId, payload)
      } else {
        res = await createAddon(payload)
      }

      if (res.success) {
        toast.success(`Addon ${isEditMode ? "updated" : "created"} successfully!`)
        setIsOpen(false)
        queryClient.invalidateQueries({ queryKey: ["admin", "addons-data"] })
      } else {
        toast.error(res.error || `Failed to ${isEditMode ? "update" : "create"} addon`)
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this addon? This cannot be undone.")) return
    try {
      const res = await deleteAddon(id)
      if (res.success) {
        toast.success("Addon deleted successfully")
        queryClient.invalidateQueries({ queryKey: ["admin", "addons-data"] })
      } else {
        toast.error(res.error || "Failed to delete addon")
      }
    } catch {
      toast.error("Failed to delete addon")
    }
  }

  if (isLoading && addons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">
          Loading Addons...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <h2 className="font-sans text-2xl font-semibold text-foreground leading-none">
            Product Addons
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {addons.length} addons · {addons.filter((a: any) => a.isActive).length} active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[10px] text-muted-foreground hidden lg:block">
            Assign addons to products in the{" "}
            <a href="/admin/products" className="text-primary underline-offset-2 hover:underline">Products</a>{" "}
            page
          </p>
          <Button
            onClick={openCreateModal}
            className="h-10 px-5 rounded-md bg-foreground text-background font-semibold text-xs tracking-wide hover:bg-foreground/90 transition-colors flex items-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" /> Add Addon
          </Button>
        </div>
      </div>

      {addons.length === 0 ? (
        <div className="border border-border/40 p-12 text-center bg-background">
          <PackagePlus className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            No addons found
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">
            Click &ldquo;Add New Addon&rdquo; to create one
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {addons.map((addon: any) => (
            <div key={addon.id} className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col group p-0 overflow-hidden">
              {/* Image Header */}
              <div className="aspect-[16/9] w-full bg-muted border-b border-border/40 relative">
                {addon.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={addon.image} alt={addon.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PackagePlus className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-sm ${addon.isActive ? "text-emerald-500 bg-emerald-500/10 backdrop-blur-md" : "text-muted-foreground bg-muted/80 backdrop-blur-md"}`}>
                    {addon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-sans text-lg font-bold text-foreground line-clamp-1">{addon.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{addon.slug}</p>
                  </div>
                  <span className="text-base font-bold text-foreground text-racing-yellow">
                    {Number(addon.price).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {addon.description || "No description provided."}
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => openAssignModal(addon)}
                    className="flex-1 h-10 rounded-none bg-foreground text-background font-bold text-[10px] tracking-widest uppercase hover:bg-racing-yellow hover:text-black transition-colors"
                  >
                    Assign to Products
                  </Button>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => openEditModal(addon)}
                    className="h-8 rounded-none text-[10px] uppercase tracking-widest font-bold px-2 text-muted-foreground hover:text-foreground hover:bg-muted/10"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(addon.id)}
                    className="h-8 rounded-none text-[10px] uppercase tracking-widest font-bold px-2 text-terracotta hover:text-terracotta hover:bg-terracotta/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-background border border-border/40 shadow-2xl transition-all duration-300 relative flex flex-col max-h-[90vh]">
            <div className="flex items-start justify-between p-6 border-b border-border/40 shrink-0">
              <h3 className="font-sans text-2xl font-light text-foreground">
                {isEditMode ? "Edit Addon" : "New Addon"}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6" id="addon-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (!isEditMode) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
                    }}
                    placeholder="e.g. Extra Battery"
                    className="h-10 bg-transparent border-border/60 rounded-none focus-visible:ring-0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                    Slug <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="h-10 bg-transparent border-border/60 rounded-none focus-visible:ring-0"
                    required
                  />
                </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                    Price ($) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-10 bg-transparent border-border/60 rounded-none focus-visible:ring-0"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[80px] p-3 bg-white dark:bg-background border border-border/60 rounded-none text-sm focus:outline-none focus:border-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                    Addon Image
                  </label>
                  <div className="flex gap-4 items-center">
                    {currentImage && !imageFile && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={currentImage} alt="Current" className="w-16 h-16 object-cover border border-border/40" />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="h-10 bg-white dark:bg-background border-border/60 rounded-none focus-visible:ring-0 p-1.5"
                    />
                  </div>
                </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => setIsActive(!isActive)}
                      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${isActive ? "bg-emerald-500" : "bg-muted"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                      Active
                    </span>
                  </label>
                </div>
              </form>
            </div>
            <div className="flex gap-4 justify-end px-6 py-4 border-t border-border/40 bg-muted/5 shrink-0">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting} className="rounded-none h-12 px-6 font-semibold uppercase tracking-widest text-xs">Cancel</Button>
              <Button type="submit" form="addon-form" disabled={isSubmitting} className="rounded-none h-12 px-6 bg-foreground text-background font-semibold uppercase tracking-widest text-xs">
                {isSubmitting ? "Saving..." : "Save Addon"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Products Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full max-h-[90vh] flex flex-col bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] relative">
            <div className="flex items-start justify-between p-6 border-b border-border/40 shrink-0">
              <div>
                <h3 className="font-sans text-xl font-light text-foreground">
                  Assign to Products
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Select products that support this addon</p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form id="assign-form" onSubmit={handleAssignSubmit} className="flex-1 overflow-y-auto p-6">
              {allProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products found.</p>
              ) : (
                <div className="space-y-2">
                  {allProducts.map((p: any) => (
                    <label key={p.id} className="flex items-center gap-3 p-3 border border-border/40 hover:border-foreground/30 transition-colors cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={() => toggleProductSelection(p.id)}
                        className="w-4 h-4 rounded-none border-border/60 text-foreground focus:ring-0 focus:ring-offset-0 bg-white dark:bg-background accent-foreground"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground group-hover:text-racing-yellow transition-colors">{p.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.category?.name || "Uncategorized"}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </form>
            
            <div className="flex gap-4 justify-end px-6 py-4 border-t border-border/40 bg-muted/5 shrink-0">
              <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)} disabled={isAssigning} className="rounded-none h-10 text-xs uppercase tracking-widest">Cancel</Button>
              <Button type="submit" form="assign-form" disabled={isAssigning} className="rounded-none h-10 bg-foreground text-background text-xs uppercase tracking-widest">
                {isAssigning ? "Saving..." : "Save Assignments"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
