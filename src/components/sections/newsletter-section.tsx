"use client"

import { useState } from "react"
import { ArrowRight, Radio } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section className="py-24 md:py-32 bg-smoke-dark border-t border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-carbon-dark to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-10 fade-up-section visible">

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Radio className="w-5 h-5 text-racing-red animate-pulse" />
              <p className="text-[12px] font-heading font-bold tracking-[0.35em] uppercase text-racing-red">
                Comms Link
              </p>
            </div>
            <h2 className="font-heading text-4xl md:text-6xl font-black leading-tight text-white uppercase drop-shadow-[0_0_15px_rgba(255,30,30,0.3)]">
              System Telemetry<br />
              <span className="text-racing-red">Updates</span>
            </h2>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto font-sans glass-dark p-4 border border-white/5">
            Receive exclusive part drops, firmware patch notes, and pro racing league announcements. 
            No spam — only high-octane data.
          </p>

          {submitted ? (
            <div className="py-8 border border-racing-red/50 bg-racing-red/10 animate-in fade-in zoom-in duration-500">
              <p className="font-heading font-bold text-2xl text-white uppercase tracking-widest text-shadow-glow">Connection Established.</p>
              <p className="text-sm text-gray-400 mt-2 font-mono">Standby for initial telemetry burst...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative max-w-md mx-auto mt-8">
              <div className="flex items-center border border-white/20 bg-carbon-dark focus-within:border-racing-red focus-within:shadow-[0_0_15px_rgba(255,30,30,0.4)] transition-all duration-300 p-1">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER COMMS FREQUENCY (EMAIL)"
                  required
                  className="flex-1 bg-transparent text-sm font-mono text-white focus:outline-none placeholder:text-gray-600 px-4 py-3 uppercase"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to updates"
                  className="bg-racing-red text-white p-3 hover:bg-neon-red hover:shadow-[0_0_10px_rgba(255,30,30,0.8)] transition-all"
                >
                  <ArrowRight strokeWidth={2.5} className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] font-mono text-gray-600 mt-4 tracking-widest uppercase">
                Secure connection. Terminate link at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
