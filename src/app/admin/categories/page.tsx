"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit, X, RefreshCw, Layers, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { getCategories, createCategory, updateCategory, deleteCategory, toggleCategoryStatus } from "@/actions/categories"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin", "categories-data"],
    queryFn: () => getCategories()
  })

  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState("")

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)
  const [image, setImage] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openCreateModal = () => {
    setIsEditMode(false)
    setEditingId("")
    setName("")
    setSlug("")
    setDescription("")
    setIsActive(true)
    setSortOrder(0)
    setImage("")
    setImageFile(null)
    setIsOpen(true)
  }

  const openEditModal = (category: any) => {
    setIsEditMode(true)
    setEditingId(category.id)
    setName(category.name)
    setSlug(category.slug)
    setDescription(category.description || "")
    setIsActive(category.isActive)
    setSortOrder(category.sortOrder)
    setImage(category.image || "")
    setImageFile(null)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !slug) {
      toast.error("Name and Slug are required")
      return
    }

    setIsSubmitting(true)
    try {
      let uploadedUrl = image
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        const uploadRes = await fetch("/api/admin/categories/upload", {
          method: "POST",
          body: formData
        })
        const uploadData = await uploadRes.json()
        if (!uploadData.success) {
          toast.error(uploadData.error || "Failed to upload image")
          setIsSubmitting(false)
          return
        }
        uploadedUrl = uploadData.url
      }

      const payload = {
        name,
        slug,
        description,
        image: uploadedUrl,
        isActive,
        sortOrder: Number(sortOrder)
      }

      let res
      if (isEditMode) {
        res = await updateCategory(editingId, payload)
      } else {
        res = await createCategory(payload)
      }

      if (res.success) {
        toast.success(`Category ${isEditMode ? "updated" : "created"} successfully!`)
        setIsOpen(false)
        queryClient.invalidateQueries({ queryKey: ["admin", "categories-data"] })
        queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }) // invalidate old cache
      } else {
        toast.error(res.error || `Failed to ${isEditMode ? "update" : "create"} category`)
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? This cannot be undone.")) return
    try {
      const res = await deleteCategory(id)
      if (res.success) {
        toast.success("Category deleted successfully")
        queryClient.invalidateQueries({ queryKey: ["admin", "categories-data"] })
        queryClient.invalidateQueries({ queryKey: ["admin", "categories"] })
      } else {
        toast.error(res.error || "Failed to delete category")
      }
    } catch {
      toast.error("Failed to delete category")
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleCategoryStatus(id, !currentStatus)
      if (res.success) {
        toast.success("Status updated")
        queryClient.invalidateQueries({ queryKey: ["admin", "categories-data"] })
      } else {
        toast.error(res.error || "Failed to update status")
      }
    } catch {
      toast.error("Failed to update status")
    }
  }

  if (isLoading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">
          Loading Categories...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <h2 className="font-sans text-2xl font-semibold text-foreground leading-none">
            Categories
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {categories.length} {categories.length === 1 ? "category" : "categories"} · {categories.filter((c: any) => c.isActive).length} active
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="h-10 px-5 rounded-md bg-foreground text-background font-semibold text-xs tracking-wide hover:bg-foreground/90 transition-colors flex items-center gap-2"
        >
          <Plus className="h-3.5 w-3.5" /> Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="border border-border/40 p-12 text-center bg-background">
          <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            No categories found
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">
            Click &ldquo;Add Category&rdquo; to create one
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((c: any) => (
            <div key={c.id} className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col group transition-colors hover:border-foreground/30 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-sans text-base font-bold text-foreground">{c.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.slug}</p>
                </div>
                {c.image && (
                  <div className="w-10 h-10 border border-border/40 shrink-0 ml-4 hidden sm:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all" />
                  </div>
                )}
                <div
                  onClick={() => handleToggleStatus(c.id, c.isActive)}
                  className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 cursor-pointer transition-colors ${
                    c.isActive ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20" : "text-muted-foreground bg-muted/20 hover:bg-muted/30"
                  }`}
                >
                  {c.isActive ? "Active" : "Inactive"}
                </div>
              </div>
              {c.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.description}</p>
              )}
              <div className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Products: {c._count?.products || 0} | Sort Order: {c.sortOrder}
              </div>
              <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => openEditModal(c)}
                  className="h-8 rounded-none border-border/40 text-[9px] uppercase tracking-widest font-bold"
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(c.id)}
                  className="h-8 rounded-none border-border/40 text-[9px] uppercase tracking-widest font-bold text-red-500 hover:text-red-700 hover:border-red-500/40"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 relative">
            <div className="flex items-start justify-between p-6 border-b border-border/40">
              <h3 className="font-sans text-xl font-light text-foreground">
                {isEditMode ? "Edit Category" : "New Category"}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4" id="category-form">
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
                    placeholder="e.g. RC Drift Cars"
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
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full min-h-[80px] p-3 bg-transparent border border-border/60 rounded-none text-sm focus:outline-none focus:border-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                      Category Image
                    </label>
                    <div className="flex items-center gap-4">
                      {image || imageFile ? (
                        <div className="relative w-16 h-16 border border-border/40 bg-muted/10 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={imageFile ? URL.createObjectURL(imageFile) : image} 
                            alt="Category preview" 
                            className="w-full h-full object-cover" 
                          />
                          <button 
                            type="button"
                            onClick={() => { setImage(""); setImageFile(null); }}
                            className="absolute top-0 right-0 p-1 bg-background/80 hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-16 h-16 border border-dashed border-border/60 hover:border-foreground/40 cursor-pointer bg-muted/5 transition-colors">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setImageFile(e.target.files[0])
                              }
                            }}
                          />
                        </label>
                      )}
                      <div className="text-[10px] text-muted-foreground">
                        <p>Upload a category thumbnail</p>
                        <p>Recommended: 800x800px, max 5MB (JPG/PNG/WEBP)</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                      Sort Order
                    </label>
                    <Input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                      className="h-10 bg-transparent border-border/60 rounded-none focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex items-end pb-2">
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
                </div>
              </form>
            </div>
            <div className="flex gap-4 justify-end px-6 py-4 border-t border-border/40 bg-muted/5">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting} className="rounded-none h-10 text-xs uppercase tracking-widest">Cancel</Button>
              <Button type="submit" form="category-form" disabled={isSubmitting} className="rounded-none h-10 bg-foreground text-background text-xs uppercase tracking-widest">
                {isSubmitting ? "Saving..." : "Save Category"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
