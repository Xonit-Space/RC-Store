"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Star, MessageSquare, ChevronRight, Home, RefreshCw,
  CheckCircle, Clock, PenLine, X, Send, Trash2
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog"

interface Product {
  id: string
  name: string
  slug: string
  images: string[]
  price: number
  existingReview: {
    id: string
    rating: number
    comment: string
    isApproved: boolean
    createdAt: string
  } | null
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHovered(i)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          disabled={!onChange}
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              i <= (hovered || value)
                ? "text-primary fill-primary"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewModal({
  product,
  onClose,
  onSuccess,
}: {
  product: Product
  onClose: () => void
  onSuccess: (productId: string, review: any) => void
}) {
  const [rating, setRating] = useState(product.existingReview?.rating || 0)
  const [comment, setComment] = useState(product.existingReview?.comment || "")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Please select a star rating")
    if (!comment.trim()) return toast.error("Please write a comment")
    setSubmitting(true)
    try {
      const res = await fetch("/api/customer/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, rating, comment }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Review submitted! It will appear after approval.")
        onSuccess(product.id, { ...data.data, rating, comment, isApproved: false })
        onClose()
      } else {
        toast.error(data.error || "Failed to submit review")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-background border border-racing-yellow/20 rounded-none shadow-2xl shadow-racing-yellow/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/3">
          <div className="flex items-center gap-3">
            <PenLine className="w-5 h-5 text-primary" />
            <span className="font-heading font-black text-sm uppercase tracking-widest text-foreground">
              {product.existingReview ? "Your Review" : "Write a Review"}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product info */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
          <div className="relative h-14 w-14 rounded-none bg-muted/20 border border-border/40 overflow-hidden shrink-0">
            {product.images?.[0] ? (
              <Image src={product.images[0]} alt={product.name} fill sizes="56px" className="object-cover" />
            ) : (
              <MessageSquare className="w-5 h-5 text-muted-foreground absolute inset-0 m-auto" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground line-clamp-2">{product.name}</p>
            {product.existingReview && (
              <span className={`mt-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                product.existingReview.isApproved
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
              }`}>
                {product.existingReview.isApproved ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {product.existingReview.isApproved ? "Published" : "Pending Approval"}
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Your Rating</p>
            <StarRating
              value={rating}
              onChange={product.existingReview ? undefined : setRating}
            />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Your Review</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={!!product.existingReview}
              placeholder="Share your experience with this product..."
              rows={4}
              className="w-full bg-white/5 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 px-4 py-3 resize-none focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold uppercase tracking-widest border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            {product.existingReview ? "Close" : "Cancel"}
          </button>
          {!product.existingReview && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold uppercase tracking-widest bg-primary text-background hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Submit Review
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CustomerReviewsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "reviewed" | "pending">("all")

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/customer/purchased-products")
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      } else {
        toast.error("Failed to load purchased products")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/customer/reviews")
    else if (status === "authenticated") fetchProducts()
  }, [status])

  const handleReviewSuccess = (productId: string, review: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, existingReview: review } : p))
    )
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    const id = deleteId
    setDeleteId(null)
    // Find which product has this review
    const product = products.find((p) => p.existingReview?.id === id)
    try {
      const res = await fetch(`/api/customer/reviews/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Review deleted")
        setProducts((prev) =>
          prev.map((p) => (p.id === product?.id ? { ...p, existingReview: null } : p))
        )
      } else {
        toast.error("Failed to delete review")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const filteredProducts = products.filter((p) => {
    if (filter === "reviewed") return p.existingReview !== null
    if (filter === "pending") return p.existingReview === null
    return true
  })

  const reviewedCount = products.filter((p) => p.existingReview).length
  const pendingCount = products.filter((p) => !p.existingReview).length

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading products...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-6 md:p-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <Link href="/customer" className="hover:text-primary transition flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/70">My Reviews</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-heading font-black uppercase tracking-widest text-foreground">
              Product Reviews
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Rate and review the products you&apos;ve purchased
            </p>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-2xl font-black text-primary">{reviewedCount}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Reviewed</p>
            </div>
            <div className="h-10 w-px bg-border/40" />
            <div>
              <p className="text-2xl font-black text-foreground">{pendingCount}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Awaiting</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(["all", "reviewed", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                filter === f
                  ? "bg-primary text-background border-primary"
                  : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {f === "all" ? `All (${products.length})` : f === "reviewed" ? `Reviewed (${reviewedCount})` : `Not Reviewed (${pendingCount})`}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="border border-dashed border-border/40 p-16 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-sm font-bold text-foreground">
              {products.length === 0 ? "No purchased products yet" : "No products match this filter"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {products.length === 0 ? "Purchase products to leave reviews." : "Try selecting a different filter."}
            </p>
            {products.length === 0 && (
              <Link
                href="/products"
                className="mt-6 inline-flex items-center px-6 py-2.5 bg-primary text-background text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
              >
                Browse Products
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group border border-border/30 bg-card hover:border-racing-yellow/20 transition-all duration-200 overflow-hidden"
              >
                {/* Product image */}
                <div className="relative h-40 bg-muted/10 overflow-hidden">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-muted-foreground/20" />
                    </div>
                  )}
                  {/* Review status badge */}
                  {product.existingReview && (
                    <div className={`absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${
                      product.existingReview.isApproved
                        ? "bg-emerald-500/90 text-white border-emerald-600"
                        : "bg-yellow-500/90 text-black border-yellow-600"
                    }`}>
                      {product.existingReview.isApproved ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {product.existingReview.isApproved ? "Published" : "Pending"}
                    </div>
                  )}
                </div>

                {/* Card content */}
                <div className="p-4 space-y-3">
                  <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
                    <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug">{product.name}</p>
                  </Link>

                  {/* Star display if reviewed */}
                  {product.existingReview && (
                    <div className="space-y-1.5">
                      <StarRating value={product.existingReview.rating} />
                      <p className="text-xs text-muted-foreground line-clamp-2 italic">
                        &quot;{product.existingReview.comment}&quot;
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors border ${
                        product.existingReview
                          ? "border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
                          : "bg-primary text-background border-primary hover:bg-primary/90"
                      }`}
                    >
                      {product.existingReview ? (
                        <><MessageSquare className="w-3 h-3" /> View Review</>
                      ) : (
                        <><PenLine className="w-3 h-3" /> Write Review</>
                      )}
                    </button>

                    {product.existingReview && (
                      <button
                        onClick={() => setDeleteId(product.existingReview!.id)}
                        className="p-2 border border-border/40 text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedProduct && (
        <ReviewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
