"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { registerUser } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mail, Lock, User, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      const response = await registerUser({ name, email, password })
      if (response.success) {
        setIsSuccess(true)
        toast.success("Account created successfully!")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(response.error || "Failed to create your account")
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      
      <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-slate-200/50 shadow-2xl animate-in fade-in duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NEOSHOP ULTRA
          </CardTitle>
          <CardDescription className="text-sm font-semibold">
            Create an account to start shopping premium streetwear
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
              <h3 className="font-extrabold text-xl">Registration Successful!</h3>
              <p className="text-xs text-muted-foreground font-semibold">
                Provisioning empty cart and wishlist... Redirecting you to login.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl animate-in slide-in-from-top-1">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    placeholder="Marcus Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10 h-11 bg-muted/30 border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="marcus@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 bg-muted/30 border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 bg-muted/30 border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold rounded-xl shadow-lg active:scale-95 transition mt-2"
              >
                {loading ? "Registering account..." : "Sign Up"}
              </Button>

              <div className="text-center pt-2">
                <span className="text-xs text-muted-foreground font-semibold">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 hover:text-blue-800 font-bold">
                    Sign In
                  </Link>
                </span>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
