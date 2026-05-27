import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background pt-24 pb-12 border-t border-border/40">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-24">
          
          {/* Brand Manifesto */}
          <div className="md:col-span-5 space-y-8">
            <Link href="/" className="font-serif text-3xl md:text-5xl tracking-widest text-foreground block">
              NEOSHOP
            </Link>
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground max-w-md font-serif italic">
              Crafting timeless digital commerce. A curation of the world's most exceptional products, presented with architectural precision and quiet luxury.
            </p>
          </div>

          {/* Curated Links */}
          <div className="md:col-span-3 space-y-6">
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground mb-8">Boutique</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/products" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  The Catalog
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Seasonal Collections
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Campaigns
                </Link>
              </li>
              <li>
                <Link href="/materials" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Signature Materials
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-6">
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground mb-8">Client Services</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Contact an Advisor
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
            
            {/* Minimal Newsletter */}
            <div className="pt-8">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground mb-4">The Newsletter</h3>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-transparent border-b border-border/50 pb-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/50"
                />
                <button className="absolute right-0 top-0 bottom-2 text-muted-foreground group-hover:text-accent transition-colors">
                  <ArrowRight strokeWidth={1} className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <p className="text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
            © {new Date().getFullYear()} NEOSHOP ULTRA. ALL RIGHTS RESERVED.
          </p>
          <div className="flex space-x-8">
            <Link href="/privacy" className="text-[10px] tracking-[0.1em] text-muted-foreground hover:text-foreground uppercase transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[10px] tracking-[0.1em] text-muted-foreground hover:text-foreground uppercase transition-colors">
              Terms
            </Link>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[10px] tracking-[0.1em] text-muted-foreground hover:text-foreground uppercase transition-colors">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
