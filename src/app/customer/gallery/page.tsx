"use client"

import { useState } from "react"
import { uploadGalleryImage } from "@/actions/gallery"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Upload, Image as ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CustomerGalleryUploadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [authorName, setAuthorName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await uploadGalleryImage({
      imageUrl,
      caption,
      authorName: authorName || undefined,
    })

    if (res.success) {
      toast.success("Image submitted for approval!")
      setImageUrl("")
      setCaption("")
      setAuthorName("")
      router.push("/customer")
    } else {
      toast.error(res.error || "Failed to submit image")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-2xl mx-auto w-full">
        <div className="mb-12 border-b border-border/40 pb-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-4 font-mono font-bold flex items-center gap-2">
            <ImageIcon className="w-3 h-3" /> Community
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-black text-foreground leading-none uppercase drop-shadow-[0_0_10px_rgba(255, 204, 0,0.3)]">
            Upload to Gallery
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-4 leading-relaxed">
            Share your RC builds, action shots, and track moments with the community. 
            All submissions are reviewed before being featured on our main page.
          </p>
        </div>

        <div className="glass-dark border border-border p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block">
                Image URL
              </label>
              <Input 
                required
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-12 bg-muted/50 border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-colors font-mono text-sm"
              />
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Please provide a direct URL to your image (Imgur, Cloudinary, etc.)
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block">
                Display Name / Tag
              </label>
              <Input 
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="@yourhandle"
                className="h-12 bg-muted/50 border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-colors font-mono text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block">
                Caption
              </label>
              <Textarea 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Tell us about your build..."
                className="min-h-[120px] bg-muted/50 border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-colors font-mono text-sm resize-none"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(255, 204, 0,0.4)] rounded-none font-bold text-xs tracking-[0.2em] uppercase transition-all mt-4"
            >
              {loading ? "Submitting..." : (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Submit to Gallery
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
