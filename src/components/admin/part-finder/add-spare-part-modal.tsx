"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, ImagePlus } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { adminCreateProduct } from "@/actions/product"
import { linkProductToModel } from "@/actions/part-finder"

interface ImageSlot {
  id: string
  url: string
  file?: File
}

export function AddSparePartModal({
  isOpen,
  onClose,
  vehicleModelId,
  dbCategories = [],
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  vehicleModelId: string
  dbCategories?: any[]
  onSuccess?: () => void
}) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Basic Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState("")

  // Images State
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  if (!isOpen) return null

  const handleFile = (index: number, file: File) => {
    const preview = URL.createObjectURL(file)
    const newSlots = [...imageSlots]
    if (index < newSlots.length) {
      newSlots[index] = { ...newSlots[index], url: preview, file }
    } else {
      newSlots.push({ id: Math.random().toString(), url: preview, file })
    }
    setImageSlots(newSlots)
  }

  const removeSlot = (index: number) => {
    setImageSlots(imageSlots.filter((_, i) => i !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) {
      toast.error("Name and Price are required")
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Create Base Product
      const payload = {
        name,
        description,
        price: Number(price),
        categoryId,
        isActive: true
      }
      
      const res = await adminCreateProduct(session?.user?.id || "", payload)
      if (!res.success) {
        throw new Error(res.error || "Failed to create product")
      }
      
      const newProductId = res.data.id

      // 2. Link to Vehicle Model
      await linkProductToModel(newProductId, vehicleModelId)

      // 3. Upload Images
      let uploadedCount = 0
      for (let i = 0; i < imageSlots.length; i++) {
        const slot = imageSlots[i]
        if (!slot.file) continue

        const fd = new FormData()
        fd.append("file", slot.file)
        const uploadRes = await fetch("/api/admin/products/upload", { method: "POST", body: fd })
        const uploadData = await uploadRes.json()

        if (!uploadData.success) throw new Error(uploadData.error || "Image upload failed")

        await fetch(`/api/admin/products/${newProductId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: uploadData.url, sortOrder: i, isFeatured: i === 0 }),
        })
        uploadedCount++
      }

      toast.success(`Part created successfully with ${uploadedCount} image(s)!`)
      if (onSuccess) onSuccess()
      onClose()
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })

    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-background border border-border/40 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border/40 shrink-0">
          <div>
            <h3 className="font-sans text-2xl font-light text-foreground">
              Quick Add Spare Part
            </h3>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">
              Add a new part to this model in one step
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 bg-muted/5 flex-1">
          <form id="add-part-form" onSubmit={handleSave} className="space-y-8 max-w-3xl mx-auto">
            
            {/* Basic Info */}
            <div className="space-y-6">
              <h4 className="text-xs uppercase font-bold tracking-wider text-foreground pb-2 border-b border-border/40">Basic Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">
                    Part Name <span className="text-red-400">*</span>
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-12 bg-white dark:bg-background border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Base Price ($) <span className="text-red-400">*</span></label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="h-12 bg-white dark:bg-background border-border/60 rounded-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-24 p-3 bg-white dark:bg-background border border-border/60 rounded-none focus:outline-none focus:border-foreground text-sm" />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h4 className="text-xs uppercase font-bold tracking-wider text-foreground pb-2 border-b border-border/40">Part Images</h4>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => {
                  const slot = imageSlots[i]
                  return (
                    <div
                      key={i}
                      className="aspect-square border border-border/60 bg-white dark:bg-background relative group flex flex-col items-center justify-center overflow-hidden"
                    >
                      {slot ? (
                        <>
                          <img src={slot.url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeSlot(i)} className="absolute top-1 right-1 p-1 bg-background/80 text-foreground hover:bg-terracotta hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                            <X className="w-3 h-3" />
                          </button>
                          {i === 0 && (
                            <div className="absolute bottom-1 left-1 bg-foreground/80 text-background text-[8px] px-1 py-0.5 uppercase tracking-wider">
                              Main
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => inputRefs.current[i]?.click()}
                          className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        >
                          <ImagePlus className="w-4 h-4" />
                          <span className="text-[8px] uppercase tracking-wider">{i + 1}</span>
                        </button>
                      )}
                      <input
                        ref={(el) => { inputRefs.current[i] = el }}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFile(i, file)
                          e.target.value = ""
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-border/40 shrink-0 bg-white dark:bg-background">
          <Button form="add-part-form" type="submit" disabled={isSubmitting} className="h-12 px-8 rounded-none bg-foreground text-background font-bold uppercase tracking-widest">
            {isSubmitting ? "Creating & Uploading..." : "Save Part"}
          </Button>
        </div>
      </div>
    </div>
  )
}
