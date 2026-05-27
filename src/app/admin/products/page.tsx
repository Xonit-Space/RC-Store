"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Search, Package, RefreshCw, X, Coins } from "lucide-react"
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
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-slate-400 mt-2">Loading products catalog...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-snug">Product Catalog Management</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Add, edit, or delete storefront catalog listings.</p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-11 px-5 rounded-xl bg-primary text-white font-bold"
        >
          <Plus className="h-4.5 w-4.5 mr-2" /> Add Product
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 border-slate-200 focus:border-primary rounded-xl text-sm outline-none"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="border border-dashed p-12 text-center rounded-2xl">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No products found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <Card key={p.id} className="border border-slate-100 rounded-2xl shadow-sm bg-card overflow-hidden flex flex-col justify-between">
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1">{p.name}</h3>
                    <Badge variant="secondary" className="text-[9px] font-extrabold bg-slate-100 text-slate-500 uppercase mt-1">
                      {p.gender}
                    </Badge>
                  </div>
                  <span className="text-sm font-extrabold text-primary">Rs. {p.price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-400 font-semibold line-clamp-2 leading-relaxed">{p.description}</p>
              </div>

              <div className="bg-slate-50/50 border-t border-slate-100 p-4 flex justify-end">
                <Button
                  onClick={() => handleDelete(p.id)}
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-red-100 hover:bg-red-50 text-red-500 text-xs font-bold"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Product Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#0e0918]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-1">Add New Catalog Product</h3>
            <p className="text-xs text-slate-400 mb-6 font-semibold">Enter the platform parameters for the new inventory item.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Product Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Premium Leather Jacket"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                <Input
                  type="text"
                  placeholder="Product catalog description details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-10 border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Price (Rs.)</label>
                  <Input
                    type="number"
                    placeholder="999.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-10 border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-10 border border-slate-200 rounded-xl w-full text-xs font-bold text-slate-600 px-3 outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Gender Target</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="h-10 border border-slate-200 rounded-xl w-full text-xs font-bold text-slate-600 px-3 outline-none"
                >
                  <option value="UNISEX">Unisex</option>
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="KIDS">Kids</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="h-10 rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 rounded-xl bg-primary text-white text-xs font-bold"
                >
                  {isSubmitting ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
