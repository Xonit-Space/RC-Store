"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // Integration point: hook into your marketing service here
    setSubmitted(true)
  }

  return (
    <section className="py-24 md:py-32 bg-background border-t border-border/40">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-2xl mx-auto text-center space-y-10">

          <div className="space-y-4">
            <p className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              The Edit
            </p>
            <h2 className="font-serif text-4xl md:text-6xl font-light leading-tight text-foreground">
              Stay in the<br />
              <em style={{ fontStyle: "italic" }}>conversation</em>
            </h2>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Seasonal lookbooks, new collection previews, and quiet dispatches from our ateliers. 
            No weekly noise — only what matters.
          </p>

          {submitted ? (
            <div className="py-4">
              <p className="font-serif text-2xl text-foreground italic">Thank you for joining.</p>
              <p className="text-sm text-muted-foreground mt-2">Your first dispatch arrives shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
              <div className="flex items-end border-b border-border pb-2 group focus-within:border-accent transition-colors duration-300">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50 py-1"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="ml-4 text-muted-foreground hover:text-accent transition-colors group-focus-within:text-accent"
                >
                  <ArrowRight strokeWidth={1} className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-4 tracking-wider">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
