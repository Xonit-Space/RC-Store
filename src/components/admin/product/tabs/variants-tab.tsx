"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit, X } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { adminAddVariant, adminUpdateVariant } from "@/actions/product"

export function VariantsTab({ product, localVariants, setLocalVariants }: { product?: any, localVariants: any[], setLocalVariants: React.Dispatch<React.SetStateAction<any[]>> }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const productId = product?.id

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
  const [isEditVariant, setIsEditVariant] = useState(false)
  const [editingVariantId, setEditingVariantId] = useState<string | number>("")

  const [sku, setSku] = useState("")
  const [size, setSize] = useState("")
  const [color, setColor] = useState("")
  const [colorName, setColorName] = useState("")
  const [variantPrice, setVariantPrice] = useState("")
  const [stock, setStock] = useState("")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use local state if no product ID exists (we are in Create mode)
  const isLocalMode = !productId
  
  // Combine DB variants with local variants for display
  const displayVariants = isLocalMode ? localVariants : (product?.variants || [])

  const openNewVariantModal = () => {
    setIsEditVariant(false)
    setEditingVariantId("")
    setSku("")
    setSize("")
    setColor("")
    setColorName("")
    setVariantPrice("")
    setStock("")
    setLocation("")
    setIsVariantModalOpen(true)
  }

  const openEditVariantModal = (v: any) => {
    setIsEditVariant(true)
    setEditingVariantId(v.id || v.localId)
    setSku(v.sku || "")
    setSize(v.size || "")
    setColor(v.color || "")
    setColorName(v.colorName || "")
    setVariantPrice(v.price ? v.price.toString() : "")
    
    const totalStock = v.inventory?.quantity || v.stock || 0
    const loc = v.inventory?.location || v.location || ""
    setStock(totalStock.toString())
    setLocation(loc)
    
    setIsVariantModalOpen(true)
  }

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sku || !variantPrice || !stock) {
      toast.error("SKU, Price, and Stock are required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        sku,
        size,
        color,
        colorName,
        price: Number(variantPrice),
        stock: parseInt(stock, 10),
        location,
      }

      if (isLocalMode) {
        if (isEditVariant) {
          setLocalVariants(prev => prev.map(v => v.localId === editingVariantId ? { ...v, ...payload } : v))
          toast.success("Updated local variant")
        } else {
          setLocalVariants(prev => [...prev, { ...payload, localId: Date.now() }])
          toast.success("Added local variant")
        }
        setIsVariantModalOpen(false)
      } else {
        let res
        if (isEditVariant) {
          res = await adminUpdateVariant(session?.user?.id || "", editingVariantId as string, payload)
        } else {
          res = await adminAddVariant(session?.user?.id || "", productId, payload)
        }
        
        if (res.success) {
          toast.success(`Successfully ${isEditVariant ? "updated" : "added"} variant!`)
          setIsVariantModalOpen(false)
          queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
        } else {
          toast.error(res.error || `Failed to ${isEditVariant ? "update" : "add"} variant`)
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteVariant = async (v: any) => {
    if (!confirm("Are you sure you want to delete this variant?")) return
    if (isLocalMode) {
      setLocalVariants(prev => prev.filter(item => item.localId !== v.localId))
    } else {
      // NOTE: Assume adminDeleteVariant exists or we can just toast for now if not imported
      toast.error("Variant deletion API not implemented here yet.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-border/40 pb-4">
        <h3 className="font-sans text-2xl font-light text-foreground">SKU Variants</h3>
        <Button
          onClick={openNewVariantModal}
          className="h-10 px-4 rounded-none bg-foreground text-background font-bold text-[10px] tracking-widest uppercase"
        >
          <Plus className="h-3 w-3 mr-2" /> Add Variant
        </Button>
      </div>

      <div className="space-y-4">
        {displayVariants.length === 0 ? (
          <div className="border border-border/40 p-8 text-center bg-white dark:bg-background">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">No variants configured.</p>
          </div>
        ) : (
          displayVariants.map((v: any, idx: number) => {
            const totalStock = v.inventory?.quantity || v.stock || 0
            return (
              <div key={v.id || v.localId || idx} className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground font-mono">{v.sku}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {v.size && `Size: ${v.size}`} {v.colorName && `| Color: ${v.colorName}`}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Price</p>
                    <p className="text-sm font-bold">{v.price ? Number(v.price).toLocaleString("en-AU", { style: 'currency', currency: 'AUD' }) : (product?.price ? Number(product.price).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'}) : "N/A")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Stock</p>
                    <p className={`text-sm font-bold ${totalStock < 5 ? 'text-red-500' : 'text-emerald-500'}`}>{totalStock}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => openEditVariantModal(v)} className="h-8 w-8 p-0 rounded-none text-muted-foreground hover:bg-muted/10 hover:text-foreground">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {isLocalMode && (
                      <Button variant="ghost" onClick={() => handleDeleteVariant(v)} className="h-8 w-8 p-0 rounded-none text-red-500 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {isVariantModalOpen && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-background border border-border/40 shadow-2xl p-8 relative">
            <button
              onClick={() => setIsVariantModalOpen(false)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-sans text-2xl font-light text-foreground mb-2">{isEditVariant ? "Edit Variant" : "New Variant"}</h3>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-8">Define SKU and stock parameters</p>

            <form onSubmit={handleAddVariant} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">SKU</label>
                <Input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. TRX-SLASH-BLU"
                  className="h-12 bg-white dark:bg-background border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Size / Scale</label>
                  <Input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. 1/10"
                    className="h-12 bg-white dark:bg-background border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Color Name</label>
                  <Input
                    type="text"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    placeholder="e.g. Racing Blue"
                    className="h-12 bg-white dark:bg-background border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Variant Price ($)</label>
                  <Input
                    type="number"
                    value={variantPrice}
                    onChange={(e) => setVariantPrice(e.target.value)}
                    placeholder={product?.price ? Number(product.price).toString() : "0.00"}
                    className="h-12 bg-white dark:bg-background border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Initial Stock</label>
                  <Input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="h-12 bg-white dark:bg-background border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Warehouse Location</label>
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. A1-Bin-42"
                  className="h-12 bg-white dark:bg-background border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground font-mono"
                />
              </div>

              <div className="flex gap-4 justify-end pt-6 border-t border-border/40 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVariantModalOpen(false)}
                  className="h-12 rounded-none border-border/60 text-foreground text-xs font-bold uppercase tracking-widest bg-white dark:bg-background"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 rounded-none bg-foreground text-background text-xs font-bold uppercase tracking-widest px-8"
                >
                  {isSubmitting ? "Saving..." : isEditVariant ? "Save Changes" : "Add Variant"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
