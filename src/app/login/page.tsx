"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Zap, ShieldAlert } from "lucide-react"
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
        toast.error("CONNECTION DENIED")
      } else {
        toast.success("CONNECTION SECURED")
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err: any) {
      setError("SYSTEM MALFUNCTION. RETRY CONNECTION.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-carbon-dark relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-8 relative z-10">
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-heading font-black tracking-widest text-white uppercase drop-shadow-[0_0_10px_rgba(255, 204, 0,0.5)]">NEOSHOP <span className="text-racing-yellow">ULTRA</span></h1>
          </Link>
          <p className="mt-4 text-[10px] tracking-[0.4em] uppercase text-racing-yellow font-mono font-bold animate-pulse">
            Driver Authentication
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-[400px]">
          <div className="glass-dark py-10 px-8 md:px-10 border border-racing-yellow/40 shadow-[0_0_30px_rgba(255, 204, 0,0.15)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-racing-yellow to-transparent opacity-50" />
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-950/50 border border-red-500/50 text-yellow-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-yellow-500 animate-pulse" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-400">
                  Driver Tag (Email)
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-smoke-dark border-white/10 rounded-none text-white focus-visible:ring-0 focus-visible:border-racing-yellow focus-visible:shadow-[0_0_10px_rgba(255, 204, 0,0.3)] transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-400">
                    Security Key
                  </label>
                  <Link href="/forgot-password" className="text-[10px] font-mono font-bold uppercase tracking-[0.1em] text-gray-500 hover:text-racing-yellow transition-colors">
                    Override
                  </Link>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-smoke-dark border-white/10 rounded-none text-white focus-visible:ring-0 focus-visible:border-racing-yellow focus-visible:shadow-[0_0_10px_rgba(255, 204, 0,0.3)] transition-all font-mono"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-racing-yellow text-white hover:bg-neon-yellow hover:shadow-[0_0_20px_rgba(255, 204, 0,0.6)] rounded-none font-heading font-black text-sm tracking-[0.2em] uppercase transition-all"
                >
                  {loading ? "Establishing Link..." : "Initialize Link"}
                </Button>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-racing-yellow" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-400">
                      Test Protocols
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("racer@rc.com")
                        setPassword("rcadmin123")
                      }}
                      className="p-3 border border-white/5 bg-smoke-dark hover:border-racing-yellow/50 hover:bg-white/5 transition-colors text-left group"
                    >
                      <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white mb-1 group-hover:text-racing-yellow transition-colors">Pro Racer (Customer)</span>
                      <span className="block text-[10px] font-mono text-gray-500 truncate">racer@rc.com</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("admin@rc.com")
                        setPassword("rcadmin123")
                      }}
                      className="p-3 border border-white/5 bg-smoke-dark hover:border-racing-yellow/50 hover:bg-white/5 transition-colors text-left group"
                    >
                      <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-white mb-1 group-hover:text-racing-yellow transition-colors">RC Admin (Super Admin)</span>
                      <span className="block text-[10px] font-mono text-gray-500 truncate">admin@rc.com</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <p className="mt-8 text-center text-[10px] font-mono uppercase tracking-[0.1em] text-gray-500">
            No Driver Profile?{" "}
            <Link href="/register" className="font-bold text-white border-b border-racing-yellow/50 hover:border-racing-yellow transition-colors pb-0.5">
              Register Tag
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
