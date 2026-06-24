"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { resetPassword } from "@/actions/auth"
import { ResetPasswordSchema } from "@/validators/auth"

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = ResetPasswordSchema.safeParse({ token, password })
    if (!validation.success) {
      setError(validation.error.errors[0].message)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const response = await resetPassword(token, { password })
      
      if (!response.success) {
        setError(response.error || "Failed to restore credentials. Token may be invalid or expired.")
        return
      }
      
      toast.success("Password updated successfully!")
      setCompleted(true)
    } catch (err) {
      setError("Failed to restore credentials. Token may be invalid or expired.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-8">
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
          <h1 className="text-3xl font-serif tracking-tight text-foreground font-light">AUSSIE RIGS ARENA</h1>
          <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-bold">
            Password Recovery
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-[400px]">
          <div className="bg-background py-10 px-8 md:px-10 border border-border/40 shadow-sm">
            {!completed ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50/50 border border-red-100 text-red-900 text-xs font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-none font-bold text-xs tracking-widest uppercase transition-all mt-4"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-6">
                <div className="w-16 h-16 rounded-full border border-foreground flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-light text-foreground">Password Reset</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Your password has been successfully updated.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-none font-bold text-xs tracking-widest uppercase transition-all mt-4"
                >
                  Return to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
