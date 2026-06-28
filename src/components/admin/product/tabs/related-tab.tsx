"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { adminAddRelatedProduct, adminDeleteRelatedProduct } from "@/actions/product"
import { useAdminProducts } from "@/hooks/use-admin-data"

export function RelatedTab({ product }: { product: any }) {
  const queryClient = useQueryClient()
  const productId = product.id

  const [isRelatedModalOpen, setIsRelatedModalOpen] = useState(false)
  const [relatedId, setRelatedId] = useState("")
  const [relationType, setRelationType] = useState("COMPATIBLE")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: allProducts } = useAdminProducts(1, 100)

  const handleAddRelated = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!relatedId) return toast.error("Select a related product")
    setIsSubmitting(true)
    const res = await adminAddRelatedProduct(productId, { relatedId, relationType })
    if (res.success) {
      toast.success("Added related product")
      setIsRelatedModalOpen(false)
      setRelatedId("")
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
    } else toast.error(res.error)
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    const res = await adminDeleteRelatedProduct(id, productId)
    if (res.success) {
      toast.success("Deleted")
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
    } else toast.error(res.error || "Delete failed")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-border/40 pb-4">
        <h3 className="font-sans text-2xl font-light text-foreground">Related Products</h3>
        <Button onClick={() => setIsRelatedModalOpen(true)} className="h-10 px-4 rounded-none bg-foreground text-background font-bold text-[10px] tracking-widest uppercase">
          <Plus className="h-3 w-3 mr-2" /> Add Related
        </Button>
      </div>

      <div className="space-y-4">
        {product.relatedSource?.length === 0 ? (
          <div className="border border-border/40 p-8 text-center bg-white dark:bg-background"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">No related products.</p></div>
        ) : (
          product.relatedSource?.map((r: any) => (
            <div key={r.id} className="border border-border/40 p-4 flex justify-between items-center bg-white dark:bg-background">
              <div>
                <p className="text-sm font-bold">{r.related.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{r.relationType}</p>
              </div>
              <Button variant="ghost" onClick={() => handleDelete(r.relatedId)} className="text-terracotta h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))
        )}
      </div>

      {isRelatedModalOpen && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-background border border-border/40 shadow-2xl p-8 relative">
            <button onClick={() => setIsRelatedModalOpen(false)} className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition"><X className="h-5 w-5" /></button>
            <h3 className="font-sans text-2xl font-light text-foreground mb-2">Add Related Product</h3>
            <form onSubmit={handleAddRelated} className="space-y-6 mt-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Product</label>
                <select value={relatedId} onChange={e => setRelatedId(e.target.value)} className="w-full h-12 bg-background border border-border/60 rounded-none text-xs text-foreground px-3 outline-none focus:border-foreground">
                  <option value="">Select a product...</option>
                  {allProducts?.products.filter((p: any) => p.id !== productId).map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Relation Type</label>
                <select value={relationType} onChange={e => setRelationType(e.target.value)} className="w-full h-12 bg-background border border-border/60 rounded-none text-xs text-foreground px-3 outline-none focus:border-foreground">
                  <option value="COMPATIBLE">Compatible With</option>
                  <option value="ACCESSORY">Required Accessory</option>
                  <option value="UPGRADE">Upgrade Part</option>
                  <option value="FREQUENTLY_BOUGHT_TOGETHER">Frequently Bought Together</option>
                </select>
              </div>
              <div className="flex gap-4 justify-end pt-6 border-t border-border/40"><Button type="button" variant="outline" onClick={() => setIsRelatedModalOpen(false)} className="h-12 rounded-none bg-white dark:bg-background">Cancel</Button><Button type="submit" disabled={isSubmitting} className="h-12 rounded-none bg-foreground text-background">Add</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
