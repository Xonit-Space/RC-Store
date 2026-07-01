"use client"

import { useCallback, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { RefreshCw, MessageSquare, Check, X, Trash2, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { useAdminReviews, useAdminUpdateReview, useAdminDeleteReview } from "@/hooks/use-admin-data"
import { toast } from "sonner"
import Image from "next/image"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

const PAGE_SIZE = 24

export default function AdminReviewsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const currentPage = parseInt(searchParams.get("page") || "1", 10)
  
  const { data: reviewData, isLoading: loading } = useAdminReviews(currentPage, PAGE_SIZE)
  const { mutateAsync: updateReview } = useAdminUpdateReview()
  const { mutateAsync: deleteReview } = useAdminDeleteReview()
  
  const reviews = reviewData?.data || []
  const totalPages = reviewData?.pagination?.totalPages || 1
  const total = reviewData?.pagination?.total || 0

  const navigatePage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await updateReview({ id, isApproved: !currentStatus })
      toast.success(currentStatus ? "Review hidden successfully" : "Review approved successfully")
    } catch (error) {
      toast.error("Failed to update review status")
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    const id = deleteId
    setDeleteId(null)
    try {
      await deleteReview(id)
      toast.success("Review deleted successfully")
    } catch (error) {
      toast.error("Failed to delete review")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">Loading Reviews...</span>
      </div>
    )
  }

  const pending = reviews.filter((r: any) => !r.isApproved).length
  const approved = reviews.filter((r: any) => r.isApproved).length

  return (
    <div className="space-y-8 font-sans">
      <div className="pb-6 border-b border-border/40 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-sans text-2xl font-semibold text-foreground leading-none">
            Product Reviews
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {total.toLocaleString()} total reviews
          </p>
        </div>
        {/* Summary pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{pending} Pending</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{approved} Approved</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border/40">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm font-bold">No reviews found</p>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">
              Customer feedback will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review: any) => (
              <div key={review.id} className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 transition-colors hover:border-foreground/30 flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <span className={`text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest border ${review.isApproved ? "bg-forest/5 text-forest border-forest/20" : "bg-terracotta/5 text-terracotta border-terracotta/20"}`}>
                        {review.isApproved ? "APPROVED" : "PENDING"}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground mb-4 line-clamp-3">
                    &quot;{review.comment || "No comment provided."}&quot;
                  </p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                      <div className="h-8 w-8 bg-muted/10 border border-border/40 shrink-0 flex items-center justify-center overflow-hidden">
                        {review.product?.images?.[0] ? (
                          <Image src={review.product.images[0]} alt="" width={32} height={32} className="object-cover" />
                        ) : (
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-foreground truncate max-w-[150px]">{review.product?.name}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{review.user?.name || review.user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border/40 bg-muted/5 flex divide-x divide-border/40">
                  <button
                    onClick={() => handleToggleApproval(review.id, review.isApproved)}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:bg-muted/50 transition-colors text-foreground"
                  >
                    {review.isApproved ? (
                      <><X className="w-3 h-3 text-terracotta" /> Hide</>
                    ) : (
                      <><Check className="w-3 h-3 text-forest" /> Approve</>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteId(review.id)}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:bg-terracotta/10 transition-colors text-terracotta"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigatePage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-2 px-4 py-2 border border-border/40 text-[10px] uppercase tracking-widest font-bold text-foreground disabled:opacity-30 hover:border-foreground transition-colors"
            >
              <ChevronLeft className="h-3 w-3" /> Prev
            </button>
            <button
              onClick={() => navigatePage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-2 px-4 py-2 border border-border/40 text-[10px] uppercase tracking-widest font-bold text-foreground disabled:opacity-30 hover:border-foreground transition-colors"
            >
              Next <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this review? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
