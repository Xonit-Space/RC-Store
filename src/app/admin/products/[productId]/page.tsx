"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Image as ImageIcon, ChevronLeft, RefreshCw, X, Box } from "lucide-react"
import { toast } from "sonner"
import { adminAddVariant } from "@/actions/product"
import { useAdminProduct } from "@/hooks/use-admin-data"
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
        <div className="lg:col-span-2 space-y-6">
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
    </div>
  )
}
