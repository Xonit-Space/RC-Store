import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-carbon-dark pt-24 pb-12 border-t-2 border-racing-red/20 relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-24">
          
          {/* Brand Manifesto */}
          <div className="md:col-span-5 space-y-8">
            <Link href="/" className="font-heading font-black text-3xl md:text-5xl tracking-widest text-foreground block drop-shadow-[0_0_10px_rgba(255,30,30,0.5)]">
              NEOSHOP <span className="text-racing-red">ULTRA</span>
            </Link>
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground max-w-md font-mono uppercase">
              High-performance remote control racing systems. Precision engineered for the ultimate track experience and raw mechanical power.
            </p>
          </div>

          {/* Curated Links */}
          <div className="md:col-span-3 space-y-6">
            <h3 className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-foreground mb-8 border-b border-border pb-2">Garage</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/products" className="text-sm font-mono text-muted-foreground hover:text-racing-red transition-colors">
                  All Models
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-sm font-mono text-muted-foreground hover:text-racing-red transition-colors">
                  Racing Ecosystem
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="text-sm font-mono text-muted-foreground hover:text-racing-red transition-colors">
                  Pro League Events
                </Link>
              </li>
              <li>
                <Link href="/materials" className="text-sm font-mono text-muted-foreground hover:text-racing-red transition-colors">
                  Performance Parts
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-6">
            <h3 className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-foreground mb-8 border-b border-border pb-2">Pit Crew</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/contact" className="text-sm font-mono text-muted-foreground hover:text-racing-red transition-colors">
                  Contact Technician
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm font-mono text-muted-foreground hover:text-racing-red transition-colors">
                  Logistics & Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm font-mono text-muted-foreground hover:text-racing-red transition-colors">
                  Telemetry Manual (FAQ)
                </Link>
              </li>
            </ul>
            
            {/* Minimal Newsletter */}
            <div className="pt-8">
              <h3 className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-racing-red mb-4 flex items-center gap-2">
                <Zap className="w-3 h-3" /> System Updates
              </h3>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="DRIVER EMAIL" 
                  className="w-full bg-transparent border-b-2 border-border pb-2 text-sm font-mono text-foreground focus:outline-none focus:border-racing-red transition-colors placeholder:text-muted-foreground"
                />
                <button className="absolute right-0 top-0 bottom-2 text-muted-foreground group-hover:text-racing-red transition-colors">
                  <ArrowRight strokeWidth={2} className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <p className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
            © {new Date().getFullYear()} NEOSHOP ULTRA. ALL SYSTEMS OPERATIONAL.
          </p>
          <div className="flex space-x-8">
            <Link href="/privacy" className="text-[10px] font-mono tracking-[0.1em] text-muted-foreground hover:text-racing-red uppercase transition-colors">
              Data Policy
            </Link>
            <Link href="/terms" className="text-[10px] font-mono tracking-[0.1em] text-muted-foreground hover:text-racing-red uppercase transition-colors">
              Track Rules
            </Link>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[10px] font-mono tracking-[0.1em] text-muted-foreground hover:text-racing-red uppercase transition-colors">
              Comms Link
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
