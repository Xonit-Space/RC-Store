"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit, X, RefreshCw, PackagePlus } from "lucide-react"
import { toast } from "sonner"
import { getAddons, createAddon, updateAddon, deleteAddon } from "@/actions/addons"
import { useQuery, useQueryClient } from "@tanstack/react-query"

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openCreateModal = () => {
    setIsEditMode(false)
    setEditingId("")
    setName("")
    setSlug("")
    setDescription("")
    setPrice("")
    setIsActive(true)
    setIsOpen(true)
  }

  const openEditModal = (addon: any) => {
    setIsEditMode(true)
    setEditingId(addon.id)
    setName(addon.name)
    setSlug(addon.slug)
    setDescription(addon.description || "")
    setPrice(addon.price.toString())
    setIsActive(addon.isActive)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !slug || !price) {
      toast.error("Name, Slug, and Price are required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name,
        slug,
        description,
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {addons.map((addon: any) => (
            <div key={addon.id} className="border border-border/40 bg-background flex flex-col group transition-colors hover:border-foreground/30 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-sans text-base font-bold text-foreground line-clamp-1">{addon.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{addon.slug}</p>
                </div>
                <span className="text-sm font-bold text-foreground">
                  Rs. {Number(addon.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{addon.description || "No description"}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 ${addon.isActive ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground bg-muted/20"}`}>
                  {addon.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => openEditModal(addon)}
                  className="h-8 rounded-none border-border/40 text-[9px] uppercase tracking-widest font-bold"
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(addon.id)}
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
          <div className="max-w-md w-full bg-background border border-border shadow-2xl relative">
            <div className="flex items-start justify-between p-6 border-b border-border/40">
              <h3 className="font-sans text-xl font-light text-foreground">
                {isEditMode ? "Edit Addon" : "New Addon"}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4" id="addon-form">
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
            <div className="flex gap-4 justify-end px-6 py-4 border-t border-border/40 bg-muted/5">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting} className="rounded-none h-10 text-xs uppercase tracking-widest">Cancel</Button>
              <Button type="submit" form="addon-form" disabled={isSubmitting} className="rounded-none h-10 bg-foreground text-background text-xs uppercase tracking-widest">
                {isSubmitting ? "Saving..." : "Save Addon"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
