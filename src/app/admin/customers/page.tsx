"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Shield, User } from "lucide-react"
import { toast } from "sonner"

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/pos/customers")
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data || [])
      } else {
        toast.error("Failed to load user accounts registry")
      }
    } catch (err) {
      toast.error("Failed to execute database lookup")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <div key={u.id} className="border border-border/40 bg-background transition-colors hover:border-foreground/30">
            <div className="p-6 flex items-start gap-5">
              <div className="h-12 w-12 bg-muted/10 border border-border/40 flex items-center justify-center text-muted-foreground shrink-0">
                {u.email === "admin@neoshop.com" ? (
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
    </div>
  )
}
