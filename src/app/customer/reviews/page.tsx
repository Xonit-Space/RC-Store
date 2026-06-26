"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MessageSquare, RefreshCw, ChevronRight, Home, Trash2, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CustomerReviewsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/customer/reviews")
      if (res.ok) {
        const data = await res.json()
        setReviews(data || [])
      } else {
        toast.error("Failed to load your reviews")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/customer/reviews")
    } else if (status === "authenticated") {
      fetchReviews()
    }
  }, [status])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return
    try {
      const res = await fetch(`/api/customer/reviews/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Review deleted successfully")
        setReviews(reviews.filter(r => r.id !== id))
      } else {
        toast.error("Failed to delete review")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <div className="flex-grow flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            <span className="text-sm font-bold text-muted/50">Loading reviews...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between text-foreground font-sans">
      <main className="flex-grow container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          <Link href="/customer" className="hover:text-primary transition flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/70">My Reviews</span>
        </div>

        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight leading-snug">My Product Reviews</h2>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">Manage your feedback and ratings for purchased items.</p>
          </div>
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>

        {reviews.length === 0 ? (
          <Card className="border border-dashed border-border/40 p-12 text-center rounded-none">
            <CardContent className="pt-6">
              <MessageSquare className="h-14 w-14 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm font-bold text-foreground">No reviews yet</p>
              <p className="text-xs text-muted-foreground pt-1 mb-6">You haven't reviewed any products yet.</p>
              <Link href="/products" className="inline-flex h-11 items-center justify-center px-6 rounded-none bg-primary hover:bg-primary/95 text-foreground text-xs font-bold transition">
                Browse Products
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <Card key={review.id} className="border border-muted/10 rounded-none shadow-sm overflow-hidden bg-card transition hover:border-border/40">
                <div className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest border ${review.isApproved ? "bg-forest/5 text-forest border-forest/20" : "bg-terracotta/5 text-terracotta border-terracotta/20"}`}>
                      {review.isApproved ? "PUBLISHED" : "PENDING"}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground mb-4 flex-1">
                    "{review.comment}"
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-muted/20">
                    <Link href={`/products/${review.product?.slug}`} className="flex items-center gap-3 hover:opacity-80 transition">
                      <div className="relative h-10 w-10 rounded-none bg-muted/10 flex items-center justify-center shrink-0 overflow-hidden border border-border/40">
                        {review.product?.images?.[0] ? (
                          <Image src={review.product.images[0]} alt={review.product.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">{review.product?.name}</p>
                    </Link>
                    <button 
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-muted-foreground hover:text-terracotta transition shrink-0"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
