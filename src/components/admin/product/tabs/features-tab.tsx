"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { adminAddProductFeatureBlock, adminDeleteProductFeatureBlock } from "@/actions/product"

export function FeaturesTab({ product, localFeatures, setLocalFeatures }: { product?: any, localFeatures: any[], setLocalFeatures: React.Dispatch<React.SetStateAction<any[]>> }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const productId = product?.id
  const isLocalMode = !productId

  const displayFeatures = isLocalMode ? localFeatures : (product?.featureBlocks || [])

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [blockTitle, setBlockTitle] = useState("")
  const [blockDesc, setBlockDesc] = useState("")
  const [blockImgFile, setBlockImgFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blockTitle || !blockDesc) return toast.error("Title and Description are required")
    setIsSubmitting(true)
    
    if (isLocalMode) {
       setLocalFeatures(prev => [...prev, { 
         localId: Date.now(), 
         title: blockTitle, 
         description: blockDesc, 
         file: blockImgFile, 
         image: blockImgFile ? URL.createObjectURL(blockImgFile) : "" 
       }])
       toast.success("Added feature block to draft")
       setIsBlockModalOpen(false)
       setBlockTitle(""); setBlockDesc(""); setBlockImgFile(null)
       setIsSubmitting(false)
       return
    }

    try {
      let finalImgUrl = ""
      if (blockImgFile) {
        const formData = new FormData()
        formData.append("file", blockImgFile)
        formData.append("folder", "rc-store/features")
        const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData })
        const uploadData = await uploadRes.json()
        if (!uploadData.success) throw new Error(uploadData.error)
        finalImgUrl = uploadData.url
      }

      const res = await adminAddProductFeatureBlock(productId, { title: blockTitle, description: blockDesc, image: finalImgUrl })
      if (res.success) {
        toast.success("Added feature block")
        setIsBlockModalOpen(false)
        setBlockTitle(""); setBlockDesc(""); setBlockImgFile(null)
        queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
      } else toast.error(res.error)
    } catch(err: any) {
      toast.error(err.message || "Failed to upload feature block image")
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    
    if (isLocalMode) {
      setLocalFeatures(prev => prev.filter(f => f.localId !== id))
      return
    }
    
    const res = await adminDeleteProductFeatureBlock(id)
    if (res.success) {
      toast.success("Deleted")
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
    } else toast.error(res.error || "Delete failed")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-border/40 pb-4">
        <h3 className="font-sans text-2xl font-light text-foreground">Feature Blocks</h3>
        <Button onClick={() => setIsBlockModalOpen(true)} className="h-10 px-4 rounded-none bg-foreground text-background font-bold text-[10px] tracking-widest uppercase">
          <Plus className="h-3 w-3 mr-2" /> Add Feature Block
        </Button>
      </div>

      <div className="space-y-4">
        {displayFeatures.length === 0 ? (
          <div className="border border-border/40 p-8 text-center bg-white dark:bg-background"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">No feature blocks added.</p></div>
        ) : (
          displayFeatures.map((b: any) => (
            <div key={b.id || b.localId} className="border border-border/40 p-4 flex justify-between items-center bg-white dark:bg-background">
              <div className="flex items-center gap-4">
                {b.image && <img src={b.image} alt={b.title} className="w-16 h-16 object-cover bg-muted" />}
                <div>
                  <p className="text-sm font-bold">{b.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{b.description}</p>
                </div>
              </div>
              <Button variant="ghost" onClick={() => handleDelete(b.id || b.localId)} className="text-terracotta h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))
        )}
      </div>

      {isBlockModalOpen && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-background border border-border/40 shadow-2xl p-8 relative">
            <button onClick={() => setIsBlockModalOpen(false)} className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition"><X className="h-5 w-5" /></button>
            <h3 className="font-sans text-2xl font-light text-foreground mb-2">Add Feature Block</h3>
            <form onSubmit={handleAddBlock} className="space-y-6 mt-8">
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Title</label><Input value={blockTitle} onChange={e => setBlockTitle(e.target.value)} className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Description</label><textarea value={blockDesc} onChange={e => setBlockDesc(e.target.value)} className="w-full h-24 p-3 bg-transparent border border-border/60 rounded-none focus:outline-none focus:border-foreground text-sm" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Image File (Optional)</label><Input type="file" accept="image/*" onChange={e => setBlockImgFile(e.target.files?.[0] || null)} className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground p-2" /></div>
              <div className="flex gap-4 justify-end pt-6 border-t border-border/40"><Button type="button" variant="outline" onClick={() => setIsBlockModalOpen(false)} className="h-12 rounded-none bg-white dark:bg-background">Cancel</Button><Button type="submit" disabled={isSubmitting} className="h-12 rounded-none bg-foreground text-background">Add</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
