"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Search, Package, RefreshCw, X } from "lucide-react"
import { toast } from "sonner"
import { adminCreateProduct, adminDeleteProduct } from "@/actions/product"

export default function AdminProductsPage() {
  const { data: session } = useSession()

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Add Product form state
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [gender, setGender] = useState<"MEN" | "WOMEN" | "KIDS" | "UNISEX">("UNISEX")
  const [categoryId, setCategoryId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/products/categories"),
      ])

      if (prodRes.ok && catRes.ok) {
        const prodData = await prodRes.json()
        const catData = await catRes.json()
        setProducts(prodData || [])
        setCategories(catData || [])
        if (catData && catData.length > 0) {
          setCategoryId(catData[0].id)
        }
      }
    } catch (err) {
      toast.error("Failed to load catalog data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) {
      toast.error("Name and price are required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name,
        description,
        price: Number(price),
        gender,
        categoryId,
        attributes: [],
        isActive: true,
        isFeatured: false,
      }

      const res = await adminCreateProduct(session?.user?.id || "", payload)
      if (res.success) {
        toast.success("Successfully created product!")
        setIsOpen(false)
        setName("")
        setDescription("")
        setPrice("")
        await loadData()
      } else {
        toast.error(res.error || "Failed to create product")
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const res = await adminDeleteProduct(session?.user?.id || "", productId)
      if (res.success) {
        toast.success("Product successfully deleted!")
        await loadData()
      } else {
        toast.error(res.error || "Failed to delete product")
      }
    } catch (err) {
      toast.error("Failed to delete product")
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">Loading Catalog...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
            Inventory
          </p>
          <h2 className="font-sans text-3xl font-light text-foreground leading-none">
            Product Catalog
          </h2>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 px-6 rounded-none bg-foreground text-background font-bold text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 bg-transparent border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors placeholder:uppercase placeholder:tracking-wider placeholder:text-[10px]"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="border border-border/40 p-12 text-center bg-background">
          <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="border border-border/40 bg-background flex flex-col justify-between group transition-colors hover:border-foreground/30">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-sans text-lg font-light text-foreground line-clamp-2 leading-tight mb-2">{p.name}</h3>
                    <span className="inline-block text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase border border-border/40 px-2 py-1">
                      {p.gender}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-foreground whitespace-nowrap">Rs. {p.price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{p.description}</p>
              </div>

              <div className="border-t border-border/40 p-4 flex justify-end bg-muted/5">
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex items-center text-[10px] uppercase tracking-widest font-bold text-terracotta hover:text-red-700 transition-colors px-3 py-2"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-background border border-border shadow-2xl p-8 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-sans text-2xl font-light text-foreground mb-2">New Product</h3>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-8">Define catalog item parameters</p>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Product Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Description</label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Price (Rs.)</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-12 bg-transparent border border-border/60 rounded-none w-full text-xs text-foreground px-3 outline-none focus:border-foreground"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] block">Target Group</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="h-12 bg-transparent border border-border/60 rounded-none w-full text-xs text-foreground px-3 outline-none focus:border-foreground"
                >
                  <option value="UNISEX">Unisex</option>
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="KIDS">Kids</option>
                </select>
              </div>

              <div className="flex gap-4 justify-end pt-6 border-t border-border/40 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="h-12 rounded-none border-border/60 text-foreground text-xs font-bold uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 rounded-none bg-foreground text-background text-xs font-bold uppercase tracking-widest px-8"
                >
                  {isSubmitting ? "Creating..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
