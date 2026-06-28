import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8 text-foreground/80 dark:text-muted-foreground relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="inline-block font-heading font-black text-3xl tracking-widest text-foreground uppercase drop-shadow-[0_0_10px_rgba(255, 204, 0,0.5)]">
              <img src="/Transparent/logo yellow0.png" alt="Aussie Rigs Arena" className="h-8 w-auto object-contain scale-[4] md:scale-[5] origin-left pointer-events-none" />
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              The ultimate destination for high-performance remote control vehicles. We stock the best RC cars, drones, boats, and parts from industry-leading manufacturers. Built for speed, engineered for durability.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="h-10 w-10 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-foreground font-mono font-bold uppercase tracking-widest text-sm mb-6">Shop by Category</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products?category=rc-cars" className="hover:text-primary transition-colors">RC Cars & Trucks</Link></li>
              <li><Link href="/products?category=drones" className="hover:text-primary transition-colors">Drones & Multirotors</Link></li>
              <li><Link href="/products?category=rc-boats" className="hover:text-primary transition-colors">RC Boats</Link></li>
              <li><Link href="/products?category=rc-planes" className="hover:text-primary transition-colors">RC Planes</Link></li>
              <li><Link href="/products?category=electronics" className="hover:text-primary transition-colors">Batteries & Chargers</Link></li>
              <li><Link href="/products?category=parts" className="hover:text-primary transition-colors">Upgrades & Parts</Link></li>
            </ul>
          </div>

          {/* Helpful Links */}
          <div>
            <h3 className="text-foreground font-mono font-bold uppercase tracking-widest text-sm mb-6">Help & Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/help" className="hover:text-primary transition-colors">Help Center / FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/warranty" className="hover:text-primary transition-colors">Warranty Information</Link></li>
              <li><Link href="/part-finder" className="hover:text-primary transition-colors">RC Part Finder</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-foreground font-mono font-bold uppercase tracking-widest text-sm mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-foreground">(03) 8000 8036</p>
                  <p className="text-xs mt-1">Mon-Fri: 9am - 6pm EST</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href="mailto:info@aussierigsarena.com.au" className="hover:text-primary transition-colors">info@aussierigsarena.com.au</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <p>68, 56-68 Eucumbene Drive<br/>Ravenhall VIC 3023</p>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono">
          <p>© {new Date().getFullYear()} Aussie Rigs Arena. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
