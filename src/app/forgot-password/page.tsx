"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call to send email
      await new Promise((resolve) => setTimeout(resolve, 800))
      setCompleted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans bg-carbon-dark">
      {/* Column 1: Visual / Video Background (Hidden on Mobile, 2/3 width on Desktop) */}
      <div className="hidden lg:flex lg:w-2/3 relative flex-col justify-between p-10 overflow-hidden">
        {/* Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/snaptik_7531203151316258062_v3.mp4" type="video/mp4" />
        </video>

        {/* Overlay to ensure text/logo readability */}
        <div className="absolute inset-0 bg-black/60 z-10" />

        {/* Minimal Navbar / Top area */}
        <div className="relative z-20 flex items-center justify-between w-full">
          <Link href="/">
            <img src="/Transparent/logo yellow1.png" alt="Aussie Rigs Arena" className="h-20 w-auto object-contain" />
          </Link>
          <Link href="/" className="text-white text-[10px] font-mono font-bold tracking-widest uppercase border border-white/20 px-4 py-2 hover:bg-white/10 hover:border-racing-yellow transition-all">
            Back to Arena
          </Link>
        </div>

        {/* Center large branding if desired, or leave empty to showcase video */}
        <div className="relative z-20 text-center">
        </div>

        {/* Minimal Footer */}
        <div className="relative z-20 flex justify-between items-center text-white/50 text-[10px] font-mono uppercase tracking-widest">
          <p>© {new Date().getFullYear()} AUSSIE RIGS ARENA.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Column 2: Form Container (Full width on mobile, 1/3 on desktop) */}
      <div className="w-full lg:w-1/3 flex flex-col justify-center items-center px-6 py-12 relative z-10 border-l border-white/10 bg-carbon-dark shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Grid Background Decor */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-[400px] relative z-20">
          <div className="text-center mb-10 lg:hidden">
            <Link href="/" className="inline-block">
              <img src="/Transparent/logo yellow1.png" alt="Aussie Rigs Arena" className="h-12 w-auto object-contain mx-auto" />
            </Link>
          </div>

          <div className="text-left mb-8">
            <h1 className="text-3xl font-heading font-black tracking-widest text-white uppercase drop-shadow-[0_0_10px_rgba(255, 204, 0,0.5)]">
              Recovery
            </h1>
            <p className="mt-2 text-[10px] tracking-[0.4em] uppercase text-racing-yellow font-mono font-bold animate-pulse">
              Override Link
            </p>
          </div>

          <div className="glass-dark py-10 px-8 border border-racing-yellow/40 shadow-[0_0_30px_rgba(255, 204, 0,0.15)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-racing-yellow to-transparent opacity-50" />
            
            {!completed ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2 text-left mb-6">
                  <p className="text-[10px] text-gray-400 font-mono tracking-wider leading-relaxed">
                    Enter the email address associated with your account, and we will send you a link to reset your security key.
                  </p>
                </div>

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

                <div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-racing-yellow text-carbon-dark hover:bg-neon-yellow hover:shadow-[0_0_20px_rgba(255, 204, 0,0.6)] rounded-none font-heading font-black text-sm tracking-[0.2em] uppercase transition-all mt-4"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-6">
                <div className="w-16 h-16 rounded-full border border-racing-yellow flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-racing-yellow" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-xl text-white">Check Your Link</h3>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest leading-relaxed">
                    We have sent a password recovery link to<br/>
                    <strong className="text-white mt-1 block">{email}</strong>
                  </p>
                </div>
                <Link href="/login" className="w-full">
                  <Button
                    className="w-full h-12 border border-racing-yellow bg-transparent text-racing-yellow hover:bg-racing-yellow/10 rounded-none font-heading font-black text-sm tracking-[0.2em] uppercase transition-all mt-4"
                  >
                    Return to Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {!completed && (
            <p className="mt-8 text-center text-[10px] font-mono uppercase tracking-[0.1em] text-gray-500">
              Remember your password?{" "}
              <Link href="/login" className="font-bold text-white border-b border-racing-yellow/50 hover:border-racing-yellow transition-colors pb-0.5">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
