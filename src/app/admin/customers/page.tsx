"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Users, Shield, User } from "lucide-react"
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
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <span className="text-xs font-bold text-slate-400 mt-2">Loading customer accounts registry...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-snug">User Accounts Registry</h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">View and manage registered storefront customer details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <Card key={u.id} className="border border-slate-100 rounded-2xl shadow-sm bg-card overflow-hidden">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                {u.email === "customer@neoshop.ultra" ? (
                  <Shield className="w-6 h-6 text-primary" />
                ) : (
                  <User className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold text-slate-800 line-clamp-1">{u.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold leading-none">{u.email}</p>
                <div className="flex gap-2 items-center pt-1.5">
                  <Badge variant="secondary" className="text-[8px] font-extrabold px-1.5 py-0 bg-blue-50 text-blue-700 uppercase leading-none">
                    Points: {u.points}
                  </Badge>
                  <Badge variant="secondary" className="text-[8px] font-extrabold px-1.5 py-0 bg-green-50 text-green-700 uppercase leading-none">
                    Status: {u.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
