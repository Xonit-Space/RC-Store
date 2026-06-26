"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { RefreshCw, Shield, User, ChevronLeft, ChevronRight } from "lucide-react"
import { useAdminCustomers } from "@/hooks/use-admin-data"

const PAGE_SIZE = 24

export default function AdminCustomersPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentPage = parseInt(searchParams.get("page") || "1", 10)
  
  const { data: customerData, isLoading: loading } = useAdminCustomers(currentPage, PAGE_SIZE)
  
  const users = customerData?.data || []
  const totalPages = customerData?.pagination?.totalPages || 1
  const total = customerData?.pagination?.total || 0

  const navigatePage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <RefreshCw className="h-8 w-8 text-foreground animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 font-bold">Loading Accounts...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="pb-6 border-b border-border/40">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
          Clientele
        </p>
        <h2 className="font-sans text-3xl font-light text-foreground leading-none">
          User Accounts
        </h2>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
          {total.toLocaleString("en-AU", { style: 'currency', currency: 'AUD' })} registered accounts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u: any) => (
          <div key={u.id} className="border border-border/40 bg-background transition-colors hover:border-foreground/30">
            <div className="p-6 flex items-start gap-5">
              <div className="h-12 w-12 bg-muted/10 border border-border/40 flex items-center justify-center text-muted-foreground shrink-0">
                {u.email === "admin@aussierigsarena.com" ? (
                  <Shield strokeWidth={1.5} className="w-5 h-5 text-foreground" />
                ) : (
                  <User strokeWidth={1.5} className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <h3 className="font-sans text-lg font-light text-foreground line-clamp-1">{u.name || "Unknown"}</h3>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-widest mt-1">{u.email}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <span className="text-[8px] font-bold px-2 py-1 bg-muted/10 text-foreground uppercase tracking-widest border border-border/40">
                    Points: {u.points || 0}
                  </span>
                  <span className="text-[8px] font-bold px-2 py-1 bg-forest/5 text-forest uppercase tracking-widest border border-forest/20">
                    {u.status || "ACTIVE"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phase 9: Pagination controls */}
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
    </div>
  )
}
