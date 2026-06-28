"use client"

import { useState, useEffect } from "react"
import { getAdminGalleryImages, toggleGalleryImageApproval, deleteGalleryImage } from "@/actions/gallery"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

export default function AdminGalleryPage() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchImages = async () => {
    setLoading(true)
    try {
      const data = await getAdminGalleryImages()
      setImages(data)
    } catch (error) {
      toast.error("Failed to load images")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleToggleApproval = async (id: string, isApproved: boolean) => {
    const res = await toggleGalleryImageApproval(id, !isApproved)
    if (res.success) {
      toast.success(isApproved ? "Image unapproved" : "Image approved")
      fetchImages()
    } else {
      toast.error(res.error || "Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return
    const res = await deleteGalleryImage(id)
    if (res.success) {
      toast.success("Image deleted")
      fetchImages()
    } else {
      toast.error(res.error || "Failed to delete image")
    }
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-end pb-6 border-b border-border/40">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
            Community
          </p>
          <h2 className="font-sans text-3xl font-light text-foreground leading-none">
            Customer Gallery
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-muted-foreground uppercase tracking-widest text-xs p-8">Loading...</p>
        ) : images.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground uppercase tracking-widest text-xs p-8">No images found.</p>
        ) : (
          images.map((img) => (
            <div key={img.id} className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_40px_rgba(255,204,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_50px_rgba(255,204,0,0.3)] hover:border-racing-yellow/50 transition-all duration-300 flex flex-col group overflow-hidden">
              <div className="relative aspect-square bg-muted">
                <img src={img.imageUrl} alt={img.caption || "Gallery"} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <span className={`text-[9px] uppercase tracking-widest px-2 py-1 font-bold border ${img.isApproved ? "bg-forest/10 text-forest border-forest/20" : "bg-primary/10 text-primary border-primary/20 backdrop-blur-md"}`}>
                    {img.isApproved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-mono text-xs font-bold text-foreground mb-2">{img.authorName}</p>
                  {img.caption && <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{img.caption}</p>}
                  {img.product && <p className="text-[10px] text-primary uppercase tracking-widest font-mono">Product: {img.product.name}</p>}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleToggleApproval(img.id, img.isApproved)}
                    className="flex-1 text-[10px] uppercase tracking-widest font-bold h-8"
                  >
                    {img.isApproved ? (
                      <><XCircle className="w-3 h-3 mr-2 text-destructive" /> Reject</>
                    ) : (
                      <><CheckCircle2 className="w-3 h-3 mr-2 text-primary" /> Approve</>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleDelete(img.id)}
                    className="h-8 w-8 hover:text-destructive hover:border-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
