"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, ArrowLeft, KeyRound, Check } from "lucide-react"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      // Simulate API update call
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      console.log(`[Auth] Credentials updated for token: ${token}`)
      toast.success("Credentials updated successfully!")
      setCompleted(true)
    } catch (err) {
      toast.error("Failed to restore credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0918] flex flex-col justify-between text-white font-sans">
      <Header />

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="relative max-w-md w-full rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 shadow-2xl overflow-hidden">
          {/* Background flows */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#8b5cf6]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#ec4899]/10 blur-3xl pointer-events-none" />

          {!completed ? (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] mb-6">
                <KeyRound className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-bold tracking-wide mb-2">Reset Password</h2>
              <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                Configure a secure new password for your dashboard profile access logs.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 h-11 bg-white/5 border-white/10 focus:border-[#8b5cf6] text-white rounded-xl placeholder:text-gray-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9 h-11 bg-white/5 border-white/10 focus:border-[#8b5cf6] text-white rounded-xl placeholder:text-gray-500 outline-none"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-sm transition-all shadow-lg shadow-[#8b5cf6]/20"
                >
                  {loading ? "Restoring credentials..." : "Update Password"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 mb-6">
                <Check className="w-6 h-6 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold tracking-wide mb-2">Password Reset Successful</h2>
              <p className="text-gray-400 text-xs mb-8 leading-relaxed">
                Your credentials have been successfully updated. You may now proceed to sign in with your new password.
              </p>

              <Button
                onClick={() => router.push("/login")}
                className="w-full h-11 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-sm transition-all shadow-lg"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
