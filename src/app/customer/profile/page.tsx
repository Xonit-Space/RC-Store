"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { User, RefreshCw, ChevronRight, Home, ShieldCheck } from "lucide-react"
import { useCustomer } from "@/components/providers/customer-provider"
import { updateCustomerProfile } from "@/actions/auth"

export default function CustomerProfilePage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const { profile } = useCustomer()
  const [name, setName] = useState(profile?.name || "")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name)
    }
  }, [profile?.name])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/customer/profile")
    }
  }, [status])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }

    setSaving(true)
    try {
      if (!session?.user?.id) {
        toast.error("User session missing")
        return
      }

      const res = await updateCustomerProfile(session.user.id, { name })

      if (res.success) {
        toast.success("Successfully updated profile credentials!")
        // Update live JWT session cache
        await update({ name })
        router.refresh()
      } else {
        toast.error(res.error || "Failed to update profile logs")
      }
    } catch (err) {
      toast.error("Failed to execute save command")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
                <div className="flex-grow flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            <span className="text-sm font-bold text-muted/50">Loading profile details...</span>
          </div>
        </div>
              </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between text-foreground font-sans">
      
      <main className="flex-grow container mx-auto px-4 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          <a href="/customer" className="hover:text-primary transition flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Dashboard</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/70">Profile Settings</span>
        </div>

        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight leading-snug">Profile Settings</h2>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">Manage your personal identification details.</p>
          </div>
          <User className="w-8 h-8 text-primary" />
        </div>

        <div className="max-w-2xl">
          <Card className="border border-muted/10 rounded-none shadow-sm bg-card overflow-hidden">
            <CardHeader className="bg-muted/5 border-b border-muted/10 p-6">
              <CardTitle className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Account Security Profile
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-bold">
                Keep your details updated to secure your transactions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted/50 uppercase tracking-wider block">Full Name</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 border-border/40 focus:border-primary rounded-none outline-none focus:ring-2 focus:ring-primary/10 text-sm font-medium transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email Address (Read-only)</label>
                  <Input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="h-11 border-border/40 bg-muted/5 text-muted-foreground rounded-none outline-none text-sm font-bold cursor-not-allowed"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-6 rounded-none bg-primary hover:bg-primary/95 text-white text-xs font-bold transition active:scale-95 shadow-md shadow-primary/10"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

          </div>
  )
}
