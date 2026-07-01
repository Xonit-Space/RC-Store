"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, X, ImagePlus } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { 
  adminAddProductVideo, adminDeleteProductVideo, 
  adminAddProductDocument, adminDeleteProductDocument
} from "@/actions/product"

interface ImageSlot {
  id: string
  url: string
  file?: File
  uploading?: boolean
  saved?: boolean
}

export function MediaTab({ product, localMedia, setLocalMedia }: { 
  product?: any, 
  localMedia: {images: ImageSlot[], videos: any[], docs: any[]}, 
  setLocalMedia: React.Dispatch<React.SetStateAction<any>> 
}) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const productId = product?.id
  const isLocalMode = !productId

  // Combine DB images with local images
  const displayImages = isLocalMode ? localMedia.images : (product?.images || [])
  const displayVideos = isLocalMode ? localMedia.videos : (product?.videos || [])
  const displayDocs = isLocalMode ? localMedia.docs : (product?.documents || [])

  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(displayImages)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  useEffect(() => {
    if (!isLocalMode) {
      if (product?.images?.length > 0) {
        setImageSlots(product.images.map((img: any) => ({ id: img.id, url: img.url, saved: true })))
      } else {
        setImageSlots([])
      }
    } else {
      setImageSlots(localMedia.images)
    }
  }, [product?.images, isLocalMode, localMedia.images])

  const handleFile = (index: number, file: File) => {
    const preview = URL.createObjectURL(file)
    const newSlots = [...imageSlots]
    if (index < newSlots.length) {
      newSlots[index] = { ...newSlots[index], url: preview, file, saved: false }
    } else {
      newSlots.push({ id: Math.random().toString(), url: preview, file, saved: false })
    }
    setImageSlots(newSlots)
    if (isLocalMode) setLocalMedia((prev: any) => ({ ...prev, images: newSlots }))
  }

  const removeSlot = async (index: number) => {
    const slot = imageSlots[index]
    if (!isLocalMode && slot.saved && slot.id) {
      if (!confirm("Delete this image from database?")) return
      try {
        const res = await fetch(`/api/admin/products/${productId}/images?imageId=${slot.id}`, { method: "DELETE" })
        const json = await res.json()
        if (json.success) {
          toast.success("Image deleted")
          const newSlots = imageSlots.filter((_, i) => i !== index)
          setImageSlots(newSlots)
          queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
        } else {
          toast.error("Failed to delete image")
        }
      } catch (err: any) {
        toast.error(err.message)
      }
    } else {
      const newSlots = imageSlots.filter((_, i) => i !== index)
      setImageSlots(newSlots)
      if (isLocalMode) setLocalMedia((prev: any) => ({ ...prev, images: newSlots }))
    }
  }

  const uploadImages = async () => {
    if (isLocalMode) {
      toast.info("Images will be uploaded when you save the product.")
      return
    }
    
    setIsUploadingImages(true)
    let uploadedCount = 0
    for (let i = 0; i < imageSlots.length; i++) {
      const slot = imageSlots[i]
      if (slot.saved || !slot.file) continue

      setImageSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, uploading: true } : s)))

      try {
        const fd = new FormData()
        fd.append("file", slot.file)
        const uploadRes = await fetch("/api/admin/products/upload", { method: "POST", body: fd })
        const uploadData = await uploadRes.json()

        if (!uploadData.success) throw new Error(uploadData.error || "Upload failed")

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
        uploadedCount++
      } catch (err: any) {
        setImageSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, uploading: false } : s)))
        toast.error(`Image upload failed: ${err.message}`)
      }
    }
    if (uploadedCount > 0) {
      toast.success("Images uploaded successfully")
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
    }
    setIsUploadingImages(false)
  }

  const hasUnsavedImages = imageSlots.some(s => !s.saved)

  // --- Videos State ---
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoTitle, setVideoTitle] = useState("")
  const [videoType, setVideoType] = useState("DEMO")
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false)

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoFile || !videoTitle) return toast.error("Title and Video File are required")
    setIsSubmittingVideo(true)
    
    if (isLocalMode) {
       // In local mode, store the file object to be uploaded later
       setLocalMedia((prev: any) => ({
         ...prev,
         videos: [...prev.videos, { localId: Date.now(), title: videoTitle, type: videoType, file: videoFile, url: URL.createObjectURL(videoFile) }]
       }))
       toast.success("Added video to draft")
       setIsVideoModalOpen(false)
       setVideoTitle(""); setVideoFile(null)
       setIsSubmittingVideo(false)
       return
    }
    
    try {
      const formData = new FormData()
      formData.append("file", videoFile)
      formData.append("folder", "rc-store/videos")
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()
      if (!uploadData.success) throw new Error(uploadData.error)
      
      const res = await adminAddProductVideo(productId, { title: videoTitle, url: uploadData.url, type: videoType })
      if (res.success) {
        toast.success("Added video")
        setIsVideoModalOpen(false)
        setVideoTitle(""); setVideoFile(null)
        queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
      } else toast.error(res.error)
    } catch(err: any) {
      toast.error(err.message || "Failed to upload video")
    }
    setIsSubmittingVideo(false)
  }

  // --- Documents State ---
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [docName, setDocName] = useState("")
  const [docType, setDocType] = useState("MANUAL")
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false)

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!docFile || !docName) return toast.error("Name and Document File are required")
    setIsSubmittingDoc(true)
    
    if (isLocalMode) {
       setLocalMedia((prev: any) => ({
         ...prev,
         docs: [...prev.docs, { localId: Date.now(), name: docName, type: docType, file: docFile, url: URL.createObjectURL(docFile) }]
       }))
       toast.success("Added document to draft")
       setIsDocModalOpen(false)
       setDocName(""); setDocFile(null)
       setIsSubmittingDoc(false)
       return
    }

    try {
      const formData = new FormData()
      formData.append("file", docFile)
      formData.append("folder", "rc-store/documents")
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()
      if (!uploadData.success) throw new Error(uploadData.error)

      const res = await adminAddProductDocument(productId, { name: docName, url: uploadData.url, type: docType })
      if (res.success) {
        toast.success("Added document")
        setIsDocModalOpen(false)
        setDocName(""); setDocFile(null)
        queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
      } else toast.error(res.error)
    } catch(err: any) {
      toast.error(err.message || "Failed to upload document")
    }
    setIsSubmittingDoc(false)
  }

  const handleDelete = async (action: any, id: string, type: 'video' | 'doc') => {
    if (!confirm("Are you sure?")) return
    
    if (isLocalMode) {
      if (type === 'video') {
         setLocalMedia((prev: any) => ({ ...prev, videos: prev.videos.filter((v: any) => v.localId !== id) }))
      } else {
         setLocalMedia((prev: any) => ({ ...prev, docs: prev.docs.filter((d: any) => d.localId !== id) }))
      }
      return
    }
    
    const res = await action(id)
    if (res.success) {
      toast.success("Deleted")
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
    } else toast.error(res.error || "Delete failed")
  }

  return (
    <div className="space-y-12">
      {/* IMAGES */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-border/40 pb-4">
          <h3 className="font-sans text-2xl font-light text-foreground">Product Images</h3>
          {!isLocalMode && (
            <Button
              onClick={uploadImages}
              disabled={!hasUnsavedImages || isUploadingImages}
              className="h-10 px-4 rounded-none bg-foreground text-background font-bold text-[10px] tracking-widest uppercase"
            >
              {isUploadingImages ? "Uploading..." : "Save Images"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => {
            const slot = imageSlots[i]
            return (
              <div
                key={i}
                className="aspect-square border border-border/60 bg-white dark:bg-background relative group flex flex-col items-center justify-center overflow-hidden"
              >
                {slot ? (
                  <>
                    <img src={slot.url} alt={`Preview ${i}`} className={`w-full h-full object-cover transition-opacity ${slot.uploading ? 'opacity-40' : 'opacity-100'}`} />
                    <button onClick={() => removeSlot(i)} disabled={isUploadingImages} className="absolute top-2 right-2 p-1 bg-background/80 text-foreground hover:bg-terracotta hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <X className="w-4 h-4" />
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
                    disabled={isUploadingImages}
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
                  disabled={isUploadingImages}
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

      {/* VIDEOS */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-border/40 pb-4">
          <h3 className="font-sans text-2xl font-light text-foreground">Videos</h3>
          <Button onClick={() => setIsVideoModalOpen(true)} className="h-10 px-4 rounded-none bg-foreground text-background font-bold text-[10px] tracking-widest uppercase">
            <Plus className="h-3 w-3 mr-2" /> Add Video
          </Button>
        </div>
        <div className="space-y-4">
          {displayVideos.length === 0 ? (
            <div className="border border-border/40 p-8 text-center bg-white dark:bg-background"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">No videos added.</p></div>
          ) : (
            displayVideos.map((v: any) => (
              <div key={v.id || v.localId} className="border border-border/40 p-4 flex justify-between items-center bg-white dark:bg-background">
                <div>
                  <p className="text-sm font-bold">{v.title}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{v.type} | {v.url}</p>
                </div>
                <Button variant="ghost" onClick={() => handleDelete(adminDeleteProductVideo, v.id || v.localId, 'video')} className="text-terracotta h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DOCUMENTS */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-border/40 pb-4">
          <h3 className="font-sans text-2xl font-light text-foreground">Documents</h3>
          <Button onClick={() => setIsDocModalOpen(true)} className="h-10 px-4 rounded-none bg-foreground text-background font-bold text-[10px] tracking-widest uppercase">
            <Plus className="h-3 w-3 mr-2" /> Add Document
          </Button>
        </div>
        <div className="space-y-4">
          {displayDocs.length === 0 ? (
            <div className="border border-border/40 p-8 text-center bg-white dark:bg-background"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">No documents added.</p></div>
          ) : (
            displayDocs.map((d: any) => (
              <div key={d.id || d.localId} className="border border-border/40 p-4 flex justify-between items-center bg-white dark:bg-background">
                <div>
                  <p className="text-sm font-bold">{d.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{d.type} | {d.url}</p>
                </div>
                <Button variant="ghost" onClick={() => handleDelete(adminDeleteProductDocument, d.id || d.localId, 'doc')} className="text-terracotta h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODALS FOR VIDEO/DOC */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-background border border-border/40 shadow-2xl p-8 relative">
            <button onClick={() => setIsVideoModalOpen(false)} className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition"><X className="h-5 w-5" /></button>
            <h3 className="font-sans text-2xl font-light text-foreground mb-2">Add Video</h3>
            <form onSubmit={handleAddVideo} className="space-y-6 mt-8">
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Title</label><Input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Video File</label><Input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground p-2" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Type</label><select value={videoType} onChange={e => setVideoType(e.target.value)} className="w-full h-12 bg-background border border-border/60 rounded-none text-xs text-foreground px-3 outline-none focus:border-foreground"><option value="DEMO">Demo</option><option value="SETUP">Setup</option><option value="REVIEW">Review</option></select></div>
              <div className="flex gap-4 justify-end pt-6 border-t border-border/40"><Button type="button" variant="outline" onClick={() => setIsVideoModalOpen(false)} className="h-12 rounded-none bg-white dark:bg-background">Cancel</Button><Button type="submit" disabled={isSubmittingVideo} className="h-12 rounded-none bg-foreground text-background">Add</Button></div>
            </form>
          </div>
        </div>
      )}

      {isDocModalOpen && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-background border border-border/40 shadow-2xl p-8 relative">
            <button onClick={() => setIsDocModalOpen(false)} className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition"><X className="h-5 w-5" /></button>
            <h3 className="font-sans text-2xl font-light text-foreground mb-2">Add Document</h3>
            <form onSubmit={handleAddDoc} className="space-y-6 mt-8">
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Name</label><Input value={docName} onChange={e => setDocName(e.target.value)} className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Document File</label><Input type="file" accept="application/pdf,application/msword,text/plain" onChange={e => setDocFile(e.target.files?.[0] || null)} className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground p-2" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Type</label><select value={docType} onChange={e => setDocType(e.target.value)} className="w-full h-12 bg-background border border-border/60 rounded-none text-xs text-foreground px-3 outline-none focus:border-foreground"><option value="MANUAL">Manual</option><option value="DATASHEET">Datasheet</option></select></div>
              <div className="flex gap-4 justify-end pt-6 border-t border-border/40"><Button type="button" variant="outline" onClick={() => setIsDocModalOpen(false)} className="h-12 rounded-none bg-white dark:bg-background">Cancel</Button><Button type="submit" disabled={isSubmittingDoc} className="h-12 rounded-none bg-foreground text-background">Add</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
