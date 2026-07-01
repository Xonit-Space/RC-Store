"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { User, RefreshCw, ChevronRight, Home, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react"
import { useCustomer } from "@/components/providers/customer-provider"
import { updateCustomerProfile } from "@/actions/auth"

export default function CustomerProfilePage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const { profile } = useCustomer()

  // Profile form state
  const [name, setName] = useState(profile?.name || "")
  const [saving, setSaving] = useState(false)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (profile?.name) setName(profile.name)
  }, [profile?.name])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/customer/profile")
  }, [status])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error("Name is required"); return }
    setSaving(true)
    try {
      if (!session?.user?.id) { toast.error("User session missing"); return }
      const res = await updateCustomerProfile(session.user.id, { name })
      if (res.success) {
        toast.success("Profile updated successfully!")
        await update({ name })
        router.refresh()
      } else {
        toast.error(res.error || "Failed to update profile")
      }
    } catch {
      toast.error("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required"); return
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters"); return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match"); return
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password"); return
    }

    setChangingPassword(true)
    try {
      const res = await fetch("/api/customer/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Password changed successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(data.error || "Failed to change password")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setChangingPassword(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading...</span>
        </div>
      </div>
    )
  }

  const passwordStrength = (pwd: string) => {
    if (!pwd) return { label: "", color: "" }
    if (pwd.length < 8) return { label: "Too Short", color: "bg-red-500" }
    const hasUpper = /[A-Z]/.test(pwd)
    const hasNum = /[0-9]/.test(pwd)
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
    const score = [hasUpper, hasNum, hasSpecial].filter(Boolean).length
    if (score === 3) return { label: "Strong", color: "bg-emerald-500" }
    if (score === 2) return { label: "Good", color: "bg-yellow-400" }
    return { label: "Weak", color: "bg-orange-400" }
  }

  const strength = passwordStrength(newPassword)

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
        <a href="/customer" className="hover:text-primary transition flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Dashboard
        </a>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground/70">Settings</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-heading font-black uppercase tracking-widest text-foreground">
            Account Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Manage your profile and security credentials.</p>
        </div>
        <User className="w-8 h-8 text-primary" />
      </div>

      <div className="max-w-2xl space-y-6">
        {/* ── Profile Card ── */}
        <Card className="border border-border/30 rounded-none bg-card overflow-hidden">
          <CardHeader className="bg-white/3 border-b border-white/5 p-6">
            <CardTitle className="text-sm font-extrabold text-foreground uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Profile Information
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Update your name and personal details.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 border-border/40 focus:border-primary rounded-none text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Email Address <span className="text-muted-foreground/50 normal-case font-normal">(read-only)</span>
                </label>
                <Input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="h-11 border-border/40 bg-muted/5 text-muted-foreground rounded-none text-sm cursor-not-allowed"
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="h-11 px-6 rounded-none bg-primary hover:bg-primary/90 text-background text-xs font-bold"
              >
                {saving ? <><RefreshCw className="w-3 h-3 mr-2 animate-spin" />Saving...</> : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Change Password Card ── */}
        <Card className="border border-border/30 rounded-none bg-card overflow-hidden">
          <CardHeader className="bg-white/3 border-b border-white/5 p-6">
            <CardTitle className="text-sm font-extrabold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> Change Password
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Use a strong, unique password to protect your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-5">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="h-11 border-border/40 focus:border-primary rounded-none text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="h-11 border-border/40 focus:border-primary rounded-none text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength indicator */}
                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-colors ${
                            strength.color && (
                              strength.label === "Strong" ||
                              (strength.label === "Good" && i <= 2) ||
                              (strength.label === "Weak" && i <= 1) ||
                              (strength.label === "Too Short" && i <= 1)
                            )
                              ? strength.color
                              : "bg-border/40"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${
                      strength.label === "Strong" ? "text-emerald-400" :
                      strength.label === "Good" ? "text-yellow-400" : "text-orange-400"
                    }`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`h-11 border-border/40 focus:border-primary rounded-none text-sm pr-10 ${
                      confirmPassword && newPassword !== confirmPassword ? "border-red-500/50" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={changingPassword}
                className="h-11 px-6 rounded-none bg-primary hover:bg-primary/90 text-background text-xs font-bold"
              >
                {changingPassword ? (
                  <><RefreshCw className="w-3 h-3 mr-2 animate-spin" />Updating...</>
                ) : (
                  <><Lock className="w-3 h-3 mr-2" />Update Password</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
