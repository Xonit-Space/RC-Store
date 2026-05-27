"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mail, Lock, AlertCircle, Sparkles } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const errorParam = searchParams.get("error")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(errorParam ? "Authentication credentials failed" : null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success("Successfully logged in!")
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />

      <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-slate-200/50 shadow-2xl animate-in fade-in duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NEOSHOP ULTRA
          </CardTitle>
          <CardDescription className="text-sm font-semibold">
            Sign in to check out products, manage carts, or track rosters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl animate-in slide-in-from-top-1">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 bg-muted/30 border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 block">Password</label>
                <Link href="#" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                  Forgot?
                </Link>
              </div>
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
              {loading ? "Authenticating session..." : "Sign In"}
            </Button>

            <div className="my-4 border-t border-dashed border-slate-200/50" />

            {/* Quick Demo Credentials Assistant */}
            <div className="p-3 bg-muted/30 border border-slate-200/50 rounded-xl space-y-1.5 text-xs text-muted-foreground">
              <span className="font-bold flex items-center gap-1 text-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-yellow-500 animate-pulse" /> Quick Access Demo Accounts:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("demo@neoshop.com")
                    setPassword("neoshop_secure_password_2026")
                  }}
                  className="p-1.5 border border-slate-200 bg-white rounded-lg text-left hover:bg-slate-50 transition"
                >
                  <span className="font-extrabold text-blue-600 block">Customer</span>
                  demo@neoshop.com
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@neoshop.com")
                    setPassword("neoshop_secure_password_2026")
                  }}
                  className="p-1.5 border border-slate-200 bg-white rounded-lg text-left hover:bg-slate-50 transition"
                >
                  <span className="font-extrabold text-purple-600 block">Admin ERP</span>
                  admin@neoshop.com
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-muted-foreground font-semibold">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-bold">
                  Sign Up
                </Link>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
