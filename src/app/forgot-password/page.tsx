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
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-8">
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif tracking-tight text-foreground font-light">NEOSHOP ULTRA</h1>
          </Link>
          <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-bold">
            Password Recovery
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-[400px]">
          <div className="bg-background py-10 px-8 md:px-10 border border-border/40 shadow-sm">
            {!completed ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2 text-center mb-6">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enter the email address associated with your account, and we will send you a link to reset your password.
                  </p>
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

                <div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-none font-bold text-xs tracking-widest uppercase transition-all mt-4"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-6">
                <div className="w-16 h-16 rounded-full border border-foreground flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-light text-foreground">Check Your Email</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We have sent a password recovery link to<br/>
                    <strong>{email}</strong>
                  </p>
                </div>
                <Link href="/login" className="w-full">
                  <Button
                    className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-none font-bold text-xs tracking-widest uppercase transition-all mt-4"
                  >
                    Return to Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {!completed && (
            <p className="mt-8 text-center text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Remember your password?{" "}
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
