"use client"

import { useState } from "react"
import { X, Upload } from "lucide-react"
import { toast } from "sonner"

interface GalleryModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
  onSuccess: () => void
}

export function GalleryModal({ isOpen, onClose, productId, productName, onSuccess }: GalleryModalProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl.trim()) {
      toast.error("Please provide an image URL")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/customer/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, imageUrl, caption })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Image submitted to gallery for approval")
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || "Failed to submit image")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-carbon-dark/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-dark border border-racing-yellow/50 p-8 w-full max-w-md shadow-[0_0_30px_rgba(255, 204, 0,0.15)] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-racing-yellow to-transparent opacity-50" />
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-heading text-2xl font-black tracking-wider text-foreground uppercase flex items-center gap-2">
            <Upload className="h-6 w-6 text-primary" />
            Upload to Gallery
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-primary transition-colors">
            <X strokeWidth={2} className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-[11px] font-mono font-bold tracking-widest uppercase text-foreground mb-1">
            {productName}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
            Share your build with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground block">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              required
              className="w-full bg-muted border-b border-border pb-2 pt-2 px-2 text-sm text-foreground focus:outline-none focus:border-racing-yellow transition-colors font-mono placeholder-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-mono tracking-[0.25em] uppercase text-muted-foreground block">
              Caption (Optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="My custom build..."
              className="w-full bg-muted border-b border-border pb-2 pt-2 px-2 text-sm text-foreground focus:outline-none focus:border-racing-yellow transition-colors font-mono placeholder-gray-600"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-4 border border-border text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-foreground hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-4 bg-primary text-[10px] font-heading font-black tracking-[0.2em] uppercase text-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(255, 204, 0,0.5)] transition-all disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Submit to Gallery"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
