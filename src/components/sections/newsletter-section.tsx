"use client"

import { Send, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { subscribeNewsletter } from "@/actions/landing-page"

export function NewsletterSection() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await subscribeNewsletter(formData)
      if (res.success) {
        setSuccess(true)
      } else {
        setError(res.error || "Failed to subscribe")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-racing-yellow py-24 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
        <svg width="400" height="400" viewBox="0 0 100 100" className="animate-spin-slow">
          <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-heading font-black text-4xl md:text-5xl text-carbon-dark uppercase tracking-wider mb-4">
              Join the Pits
            </h2>
            <p className="text-carbon-dark/80 font-medium">
              Get exclusive access to new releases, setup tips, and VIP discounts before anyone else.
            </p>
          </div>

          <div className="flex-1 w-full">
            {success ? (
              <div className="bg-carbon-dark p-6 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in">
                <CheckCircle2 className="w-12 h-12 text-racing-yellow" />
                <h3 className="font-heading font-bold text-white text-xl uppercase tracking-widest">You&apos;re on the list</h3>
                <p className="text-muted-foreground text-sm">Welcome to the crew. Watch your inbox for updates.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input 
                  type="text" 
                  name="firstName"
                  placeholder="FIRST NAME"
                  required
                  className="w-full bg-carbon-dark text-white px-6 py-4 font-mono text-sm border border-transparent focus:border-white outline-none transition-colors"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="email" 
                    name="email"
                    placeholder="EMAIL ADDRESS"
                    required
                    className="flex-1 bg-carbon-dark text-white px-6 py-4 font-mono text-sm border border-transparent focus:border-white outline-none transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-white text-carbon-dark px-8 py-4 font-heading font-black uppercase tracking-widest hover:bg-smoke-dark hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Joining..." : "Subscribe"}
                    {!loading && <Send className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-red-600 font-bold text-sm text-center md:text-left">{error}</p>}
                <p className="text-carbon-dark/60 text-xs text-center md:text-left mt-2">
                  By subscribing, you agree to our Privacy Policy and Terms of Service.
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
