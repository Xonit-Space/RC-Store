"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RefreshCw, Image as ImageIcon, Upload, Trash2, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"
import { useAdminBanners, useAdminUpsertBanner, useAdminDeleteBanner } from "@/hooks/use-admin-data"
import Image from "next/image"

const POSITIONS = [
  { id: "TOP", title: "Landing Page Top Banner", description: "Displays directly below the Hero section." },
  { id: "BOTTOM", title: "Landing Page Bottom Banner", description: "Displays above the Footer." }
]

export default function AdminBannersPage() {
  const { data: banners = [], isLoading } = useAdminBanners()
  const upsertMutation = useAdminUpsertBanner()
  const deleteMutation = useAdminDeleteBanner()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">Loading Banners...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
            Content Management
          </p>
          <h2 className="font-sans text-3xl font-light text-foreground leading-none">
            Landing Page Banners
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {POSITIONS.map((pos) => {
          const banner = banners.find((b: any) => b.position === pos.id)
          return (
            <BannerForm key={pos.id} position={pos} banner={banner} upsert={upsertMutation} remove={deleteMutation} />
          )
        })}
      </div>
    </div>
  )
}

function BannerForm({ position, banner, upsert, remove }: { position: any, banner: any, upsert: any, remove: any }) {
  const [isActive, setIsActive] = useState(banner?.isActive ?? true)
  const [link, setLink] = useState(banner?.link || "")
  const [isUploading, setIsUploading] = useState(false)
  
  // Local state for previewing new uploads before saving
  const [desktopImage, setDesktopImage] = useState<string | null>(banner?.desktopImage || null)
  const [tabletImage, setTabletImage] = useState<string | null>(banner?.tabletImage || null)
  const [mobileImage, setMobileImage] = useState<string | null>(banner?.mobileImage || null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "rc-store/admin/banners")

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setter(data.url)
        toast.success("Image uploaded to Cloudinary.")
      } else {
        toast.error(data.error || "Failed to upload image")
      }
    } catch (err: any) {
      toast.error(err.message || "Upload error")
    } finally {
      setIsUploading(false)
      if (e.target) e.target.value = ""
    }
  }

  const handleSave = async () => {
    if (!desktopImage || !tabletImage || !mobileImage) {
      toast.error("Please upload all three image sizes (Desktop, Tablet, Mobile).")
      return
    }

    try {
      await upsert.mutateAsync({
        position: position.id,
        title: position.title,
        desktopImage,
        tabletImage,
        mobileImage,
        link,
        isActive
      })
      toast.success(`${position.title} saved successfully.`)
    } catch (err: any) {
      toast.error(err.message || "Failed to save banner")
    }
  }

  const handleDelete = async () => {
    if (!banner?.id) return
    if (!confirm("Are you sure you want to remove this banner? It will disappear from the landing page.")) return

    try {
      await remove.mutateAsync(banner.id)
      setDesktopImage(null)
      setTabletImage(null)
      setMobileImage(null)
      setLink("")
      setIsActive(true)
      toast.success("Banner removed successfully.")
    } catch (err: any) {
      toast.error(err.message || "Failed to remove banner")
    }
  }

  return (
    <div className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)]">
      <div className="p-6 border-b border-border/40 flex justify-between items-start">
        <div>
          <h3 className="font-sans text-xl font-light text-foreground">{position.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{position.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor={`active-${position.id}`} className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Active</Label>
          <Switch 
            id={`active-${position.id}`} 
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <ImageUploadField label="Desktop Size (e.g. 1920x600)" url={desktopImage} setter={setDesktopImage} onUpload={(e) => handleUpload(e, setDesktopImage)} isUploading={isUploading} />
          <ImageUploadField label="Tablet Size (e.g. 1024x500)" url={tabletImage} setter={setTabletImage} onUpload={(e) => handleUpload(e, setTabletImage)} isUploading={isUploading} />
          <ImageUploadField label="Mobile Size (e.g. 640x800)" url={mobileImage} setter={setMobileImage} onUpload={(e) => handleUpload(e, setMobileImage)} isUploading={isUploading} />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Target Link (Optional)</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="/category/trucks" 
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="pl-10 h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border/40 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
        {banner ? (
          <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-10 px-4 rounded-none" onClick={handleDelete} disabled={remove.isPending}>
            <Trash2 className="h-4 w-4 mr-2" /> Remove Banner
          </Button>
        ) : <div />}
        
        <Button onClick={handleSave} disabled={upsert.isPending || isUploading} className="h-10 px-8 rounded-none bg-foreground text-background font-bold text-xs tracking-widest uppercase hover:bg-foreground/90">
          {upsert.isPending ? "Saving..." : "Save Banner"}
        </Button>
      </div>
    </div>
  )
}

function ImageUploadField({ label, url, setter, onUpload, isUploading }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em]">{label}</label>
        {url && (
          <button type="button" onClick={() => setter(null)} className="text-[9px] text-destructive uppercase tracking-widest hover:underline">
            Clear
          </button>
        )}
      </div>
      
      {url ? (
        <div className="relative aspect-[21/9] w-full border border-border/40 bg-zinc-100 dark:bg-zinc-900 overflow-hidden group">
          <Image src={url} alt={label} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button type="button" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-none" onClick={() => fileInputRef.current?.click()}>
              Change Image
            </Button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`aspect-[21/9] w-full border border-dashed border-border/60 hover:border-foreground/50 transition-colors flex flex-col items-center justify-center cursor-pointer bg-zinc-50 dark:bg-zinc-900/50 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {isUploading ? (
            <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin mb-2" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
          )}
          <span className="text-xs text-muted-foreground font-medium">Click to upload image</span>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={onUpload}
        disabled={isUploading}
      />
    </div>
  )
}
