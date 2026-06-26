"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    setTimeout(() => {
      setLoading(false)
      toast.success("Your message has been sent. Our team will contact you shortly.")
      ;(e.target as HTMLFormElement).reset()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
            <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto w-full">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          
          <div className="space-y-12">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Get in Touch</p>
              <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-6">Contact Us</h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                For inquiries regarding orders, sizing, or general questions, please reach out to our client services team.
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-2">Client Services</h3>
                <p className="text-sm text-muted-foreground">support@aussierigsarena.com</p>
                <p className="text-sm text-muted-foreground">+94 77 123 4567</p>
              </div>
              
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-2">Atelier & Press</h3>
                <p className="text-sm text-muted-foreground">press@aussierigsarena.com</p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-2">Hours</h3>
                <p className="text-sm text-muted-foreground">Monday – Friday</p>
                <p className="text-sm text-muted-foreground">9:00 AM – 6:00 PM (GMT+5:30)</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/10 p-8 md:p-12 border border-border/40">
            <h2 className="font-serif text-2xl font-light text-foreground mb-8">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Full Name</label>
                <Input 
                  required
                  className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Email Address</label>
                <Input 
                  required
                  type="email"
                  className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Order Number (Optional)</label>
                <Input 
                  className="h-12 bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                  placeholder="#ORD-"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Message</label>
                <Textarea 
                  required
                  className="min-h-[150px] bg-transparent border-border/60 rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-none font-bold text-xs tracking-widest uppercase transition-all"
              >
                {loading ? "Sending..." : "Submit Inquiry"}
              </Button>
            </form>
          </div>

        </div>

      </main>
          </div>
  )
}
