"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Sparkles } from "lucide-react"
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
        toast.error("Invalid credentials")
      } else {
        toast.success("Authentication successful")
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
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-8">
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif tracking-tight text-foreground font-light">NEOSHOP ULTRA</h1>
          </Link>
          <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-bold">
            Client Authentication
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-[400px]">
          <div className="bg-background py-10 px-8 md:px-10 border border-border/40 shadow-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50/50 border border-red-100 text-red-900 text-xs font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors">
                    Reset
                  </Link>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-none font-bold text-xs tracking-widest uppercase transition-all"
                >
                  {loading ? "Authenticating..." : "Sign In"}
                </Button>
              </div>

              <div className="mt-8 border-t border-border/40 pt-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Demo Access
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("customer@neoshop.com")
                        setPassword("Customer123!")
                      }}
                      className="p-3 border border-border/40 bg-muted/10 hover:bg-muted/30 transition-colors text-left group"
                    >
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-foreground mb-1">Customer</span>
                      <span className="block text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">customer@neoshop.com</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("admin@neoshop.com")
                        setPassword("Admin123!")
                      }}
                      className="p-3 border border-border/40 bg-muted/10 hover:bg-muted/30 transition-colors text-left group"
                    >
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-foreground mb-1">Administrator</span>
                      <span className="block text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">admin@neoshop.com</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 mt-0 pt-0">
                    <button
                        type="button"
                        onClick={() => {
                          setEmail("staff@neoshop.com")
                          setPassword("Staff123!")
                        }}
                        className="p-3 border border-border/40 bg-muted/10 hover:bg-muted/30 transition-colors text-left group"
                      >
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-foreground mb-1">Staff Member</span>
                        <span className="block text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">staff@neoshop.com</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <p className="mt-8 text-center text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-foreground border-b border-foreground/30 hover:border-foreground transition-colors pb-0.5">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
