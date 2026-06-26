"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Image as ImageIcon, ChevronLeft, RefreshCw, X, Box } from "lucide-react"
import { toast } from "sonner"
import { 
  adminAddVariant, 
  adminAddProductVideo, 
  adminDeleteProductVideo, 
  adminAddProductDocument, 
  adminDeleteProductDocument,
  adminAddProductFeatureBlock,
  adminDeleteProductFeatureBlock,
  adminAddRelatedProduct,
  adminDeleteRelatedProduct
} from "@/actions/product"
import { useAdminProduct, useAdminProducts } from "@/hooks/use-admin-data"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

export default function AdminProductDetailsPage({ params }: { params: { productId: string } }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { productId } = params

  const { data: product, isLoading } = useAdminProduct(productId)

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
  const [sku, setSku] = useState("")
  const [size, setSize] = useState("")
  const [color, setColor] = useState("")
  const [colorName, setColorName] = useState("")
  const [variantPrice, setVariantPrice] = useState("")
  const [stock, setStock] = useState("")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sub-resource modals
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoTitle, setVideoTitle] = useState("")
  const [videoType, setVideoType] = useState("DEMO")

  const [isDocModalOpen, setIsDocModalOpen] = useState(false)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [docName, setDocName] = useState("")
  const [docType, setDocType] = useState("MANUAL")

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [blockTitle, setBlockTitle] = useState("")
  const [blockDesc, setBlockDesc] = useState("")
  const [blockImgFile, setBlockImgFile] = useState<File | null>(null)

  const [isRelatedModalOpen, setIsRelatedModalOpen] = useState(false)
  const [relatedId, setRelatedId] = useState("")
  const [relationType, setRelationType] = useState("COMPATIBLE")

  const { data: allProducts } = useAdminProducts(1, 100)

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

      const res = await adminAddVariant(session?.user?.id || "", productId, payload)
      if (res.success) {
        toast.success("Successfully added variant!")
        setIsVariantModalOpen(false)
        setSku("")
        setSize("")
        setColor("")
        setColorName("")
        setVariantPrice("")
        setStock("")
        setLocation("")
        queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
      } else {
        toast.error(res.error || "Failed to add variant")
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoFile || !videoTitle) return toast.error("Title and Video File are required")
    setIsSubmitting(true)
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
    setIsSubmitting(false)
  }

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!docFile || !docName) return toast.error("Name and Document File are required")
    setIsSubmitting(true)
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
    setIsSubmitting(false)
  }

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blockTitle || !blockDesc) return toast.error("Title and Description are required")
    setIsSubmitting(true)
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

  const handleDelete = async (action: any, id: string, extraId?: string) => {
    if (!confirm("Are you sure?")) return
    const res = await action(id, extraId)
    if (res.success) {
      toast.success("Deleted")
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] })
    } else toast.error(res.error || "Delete failed")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">Loading Product...</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="border border-border/40 p-12 text-center bg-background">
        <Box className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Product not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <Link href="/admin/products" className="inline-flex items-center text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ChevronLeft className="w-3 h-3 mr-1" /> Back to Catalog
          </Link>
          <h2 className="font-sans text-3xl font-light text-foreground leading-none">
            {product.name}
          </h2>
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-2">
            Base Price: {Number(product.price).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})} | {product.category?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Variants Section */}
        <div className="lg:col-span-2 space-y-12">
          {/* VARIANTS */}
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-border/40 pb-4">
              <h3 className="font-sans text-2xl font-light text-foreground">SKU Variants</h3>
              <Button
                onClick={() => setIsVariantModalOpen(true)}
                className="h-10 px-4 rounded-none bg-foreground text-background font-bold text-[10px] tracking-widest uppercase"
              >
                <Plus className="h-3 w-3 mr-2" /> Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {product.variants?.length === 0 ? (
                <div className="border border-border/40 p-8 text-center bg-background">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">No variants configured.</p>
                </div>
              ) : (
                product.variants?.map((v: any) => {
                  const totalStock = v.inventory?.reduce((acc: number, inv: any) => acc + inv.quantity, 0) || 0
                  return (
                    <div key={v.id} className="border border-border/40 bg-background p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground font-mono">{v.sku}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {v.size && `Size: ${v.size}`} {v.colorName && `| Color: ${v.colorName}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Price</p>
                          <p className="text-sm font-bold">{v.price ? Number(v.price).toLocaleString("en-AU", { style: 'currency', currency: 'AUD' }) : Number(product.price).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Stock</p>
                          <p className={`text-sm font-bold ${totalStock < 5 ? 'text-terracotta' : 'text-forest'}`}>{totalStock}</p>
                        </div>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-none text-terracotta hover:bg-terracotta/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
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
              {product.videos?.length === 0 ? (
                <div className="border border-border/40 p-8 text-center bg-background"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">No videos added.</p></div>
              ) : (
                product.videos?.map((v: any) => (
                  <div key={v.id} className="border border-border/40 p-4 flex justify-between items-center bg-background">
                    <div>
                      <p className="text-sm font-bold">{v.title}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{v.type} | {v.url}</p>
                    </div>
                    <Button variant="ghost" onClick={() => handleDelete(adminDeleteProductVideo, v.id)} className="text-terracotta h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
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
              {product.documents?.length === 0 ? (
                <div className="border border-border/40 p-8 text-center bg-background"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">No documents added.</p></div>
              ) : (
                product.documents?.map((d: any) => (
                  <div key={d.id} className="border border-border/40 p-4 flex justify-between items-center bg-background">
                    <div>
                      <p className="text-sm font-bold">{d.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{d.type} | {d.url}</p>
                    </div>
                    <Button variant="ghost" onClick={() => handleDelete(adminDeleteProductDocument, d.id)} className="text-terracotta h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FEATURE BLOCKS */}
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-border/40 pb-4">
              <h3 className="font-sans text-2xl font-light text-foreground">Feature Blocks</h3>
              <Button onClick={() => setIsBlockModalOpen(true)} className="h-10 px-4 rounded-none bg-foreground text-background font-bold text-[10px] tracking-widest uppercase">
                <Plus className="h-3 w-3 mr-2" /> Add Feature Block
              </Button>
            </div>
            <div className="space-y-4">
              {product.featureBlocks?.length === 0 ? (
                <div className="border border-border/40 p-8 text-center bg-background"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">No feature blocks added.</p></div>
              ) : (
                product.featureBlocks?.map((b: any) => (
                  <div key={b.id} className="border border-border/40 p-4 flex justify-between items-center bg-background">
                    <div className="flex items-center gap-4">
                      {b.image && <img src={b.image} alt={b.title} className="w-16 h-16 object-cover bg-muted" />}
                      <div>
                        <p className="text-sm font-bold">{b.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{b.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => handleDelete(adminDeleteProductFeatureBlock, b.id)} className="text-terracotta h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RELATED PRODUCTS */}
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-border/40 pb-4">
              <h3 className="font-sans text-2xl font-light text-foreground">Related Products</h3>
              <Button onClick={() => setIsRelatedModalOpen(true)} className="h-10 px-4 rounded-none bg-foreground text-background font-bold text-[10px] tracking-widest uppercase">
                <Plus className="h-3 w-3 mr-2" /> Add Related
              </Button>
            </div>
            <div className="space-y-4">
              {product.relatedSource?.length === 0 ? (
                <div className="border border-border/40 p-8 text-center bg-background"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">No related products.</p></div>
              ) : (
                product.relatedSource?.map((r: any) => (
                  <div key={r.id} className="border border-border/40 p-4 flex justify-between items-center bg-background">
                    <div>
                      <p className="text-sm font-bold">{r.related.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{r.relationType}</p>
                    </div>
                    <Button variant="ghost" onClick={() => handleDelete(adminDeleteRelatedProduct, r.relatedId, productId)} className="text-terracotta h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-border/40 pb-4">
            <h3 className="font-sans text-2xl font-light text-foreground">Media</h3>
            <Button
              variant="outline"
              className="h-10 px-4 rounded-none border-border/60 text-foreground font-bold text-[10px] tracking-widest uppercase"
            >
              <ImageIcon className="h-3 w-3 mr-2" /> Upload
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {product.images?.length === 0 ? (
              <div className="col-span-2 border border-border/40 p-8 text-center bg-background">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">No media available.</p>
              </div>
            ) : (
              product.images?.map((img: any) => (
                <div key={img.id} className="relative group aspect-square border border-border/40 bg-muted/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt || "Product image"} className="w-full h-full object-cover" />
                  <button className="absolute top-2 right-2 p-1.5 bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-sm">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Variant Modal */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-background border border-border shadow-2xl p-8 relative">
            <button
              onClick={() => setIsVariantModalOpen(false)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-sans text-2xl font-light text-foreground mb-2">New Variant</h3>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-8">Define SKU and stock parameters</p>

            <form onSubmit={handleAddVariant} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">SKU</label>
                <Input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. TRX-SLASH-BLU"
                  className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground font-mono"
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
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Color Name</label>
                  <Input
                    type="text"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    placeholder="e.g. Racing Blue"
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
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
                    placeholder={Number(product.price).toString()}
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Initial Stock</label>
                  <Input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
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
                  className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground font-mono"
                />
              </div>

              <div className="flex gap-4 justify-end pt-6 border-t border-border/40 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVariantModalOpen(false)}
                  className="h-12 rounded-none border-border/60 text-foreground text-xs font-bold uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 rounded-none bg-foreground text-background text-xs font-bold uppercase tracking-widest px-8"
                >
                  {isSubmitting ? "Saving..." : "Add Variant"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-background border border-border shadow-2xl p-8 relative">
            <button onClick={() => setIsVideoModalOpen(false)} className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition"><X className="h-5 w-5" /></button>
            <h3 className="font-sans text-2xl font-light text-foreground mb-2">Add Video</h3>
            <form onSubmit={handleAddVideo} className="space-y-6 mt-8">
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Title</label><Input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Video File</label><Input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground p-2" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Type</label><select value={videoType} onChange={e => setVideoType(e.target.value)} className="w-full h-12 bg-background border border-border/60 rounded-none text-xs text-foreground px-3 outline-none focus:border-foreground"><option value="DEMO">Demo</option><option value="SETUP">Setup</option><option value="REVIEW">Review</option></select></div>
              <div className="flex gap-4 justify-end pt-6 border-t border-border/40"><Button type="button" variant="outline" onClick={() => setIsVideoModalOpen(false)} className="h-12 rounded-none">Cancel</Button><Button type="submit" disabled={isSubmitting} className="h-12 rounded-none bg-foreground text-background">Add</Button></div>
            </form>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-background border border-border shadow-2xl p-8 relative">
            <button onClick={() => setIsDocModalOpen(false)} className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition"><X className="h-5 w-5" /></button>
            <h3 className="font-sans text-2xl font-light text-foreground mb-2">Add Document</h3>
            <form onSubmit={handleAddDoc} className="space-y-6 mt-8">
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Name</label><Input value={docName} onChange={e => setDocName(e.target.value)} className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Document File</label><Input type="file" accept="application/pdf,application/msword,text/plain" onChange={e => setDocFile(e.target.files?.[0] || null)} className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground p-2" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Type</label><select value={docType} onChange={e => setDocType(e.target.value)} className="w-full h-12 bg-background border border-border/60 rounded-none text-xs text-foreground px-3 outline-none focus:border-foreground"><option value="MANUAL">Manual</option><option value="DATASHEET">Datasheet</option></select></div>
              <div className="flex gap-4 justify-end pt-6 border-t border-border/40"><Button type="button" variant="outline" onClick={() => setIsDocModalOpen(false)} className="h-12 rounded-none">Cancel</Button><Button type="submit" disabled={isSubmitting} className="h-12 rounded-none bg-foreground text-background">Add</Button></div>
            </form>
          </div>
        </div>
      )}

      {/* Add Feature Block Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-background border border-border shadow-2xl p-8 relative">
            <button onClick={() => setIsBlockModalOpen(false)} className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition"><X className="h-5 w-5" /></button>
            <h3 className="font-sans text-2xl font-light text-foreground mb-2">Add Feature Block</h3>
            <form onSubmit={handleAddBlock} className="space-y-6 mt-8">
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Title</label><Input value={blockTitle} onChange={e => setBlockTitle(e.target.value)} className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Description</label><textarea value={blockDesc} onChange={e => setBlockDesc(e.target.value)} className="w-full h-24 p-3 bg-transparent border border-border/60 rounded-none focus:outline-none focus:border-foreground text-sm" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Image File (Optional)</label><Input type="file" accept="image/*" onChange={e => setBlockImgFile(e.target.files?.[0] || null)} className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground p-2" /></div>
              <div className="flex gap-4 justify-end pt-6 border-t border-border/40"><Button type="button" variant="outline" onClick={() => setIsBlockModalOpen(false)} className="h-12 rounded-none">Cancel</Button><Button type="submit" disabled={isSubmitting} className="h-12 rounded-none bg-foreground text-background">Add</Button></div>
            </form>
          </div>
        </div>
      )}

      {/* Add Related Product Modal */}
      {isRelatedModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-background border border-border shadow-2xl p-8 relative">
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
              <div className="flex gap-4 justify-end pt-6 border-t border-border/40"><Button type="button" variant="outline" onClick={() => setIsRelatedModalOpen(false)} className="h-12 rounded-none">Cancel</Button><Button type="submit" disabled={isSubmitting} className="h-12 rounded-none bg-foreground text-background">Add</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
