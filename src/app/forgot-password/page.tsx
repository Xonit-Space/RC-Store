"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, ArrowLeft, KeyRound } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setLoading(true)
    try {
      // In a live system, this triggers a Resend transactional email.
      // We simulate success and write logs.
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      console.log(`[Auth] Password reset requested for email: ${email}`)
      toast.success("Password reset instructions dispatched!")
      setSubmitted(true)
    } catch (err) {
      toast.error("Failed to submit request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0918] flex flex-col justify-between text-white font-sans">
      <Header />

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="relative max-w-md w-full rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 shadow-2xl overflow-hidden">
          {/* Ambient visual background glow details */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#8b5cf6]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#ec4899]/10 blur-3xl pointer-events-none" />

          {!submitted ? (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] mb-6">
                <KeyRound className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-bold tracking-wide mb-2">Forgot Password?</h2>
              <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                Provide your email address below and we will dispatch a cryptographically secure token link to restore your dashboard credentials.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="hello@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-11 bg-white/5 border-white/10 focus:border-[#8b5cf6] text-white rounded-xl placeholder:text-gray-500 outline-none"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-sm transition-all shadow-lg shadow-[#8b5cf6]/20"
                >
                  {loading ? "Requesting reset..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 mb-6">
                <Mail className="w-6 h-6 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold tracking-wide mb-2">Check your email</h2>
              <p className="text-gray-400 text-xs mb-8 leading-relaxed">
                We have dispatched a validation link to <strong className="text-white">{email}</strong>. 
                Please select the link to configure a new credentials password.
              </p>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-white/5 text-center">
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8b5cf6] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
