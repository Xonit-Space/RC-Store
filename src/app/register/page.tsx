"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { registerUser } from "@/actions/auth"
import { RegisterSchema } from "@/validators/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2 } from "lucide-react"
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

    const validation = RegisterSchema.safeParse({ name, email, password })
    if (!validation.success) {
      setError(validation.error.errors[0].message)
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
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-8">
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif tracking-tight text-foreground font-light">NEOSHOP ULTRA</h1>
          </Link>
          <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-bold">
            Client Registration
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-[400px]">
          <div className="bg-background py-10 px-8 md:px-10 border border-border/40 shadow-sm">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full border border-foreground flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-light text-foreground">Welcome to NeoShop Ultra</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Account provisioned.<br/>Redirecting to authentication...
                  </p>
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50/50 border border-red-100 text-red-900 text-xs font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Full Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                  />
                </div>

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
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                  />
                  <p className="text-[10px] text-muted-foreground pt-1">Must be at least 12 chars, include uppercase, lowercase, number, and special char.</p>
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-none font-bold text-xs tracking-widest uppercase transition-all mt-4"
                  >
                    {loading ? "Creating Profile..." : "Create Account"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {!isSuccess && (
            <p className="mt-8 text-center text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-foreground border-b border-foreground/30 hover:border-foreground transition-colors pb-0.5">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
