import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-carbon-dark border-t border-white/10 pt-16 pb-8 text-muted-foreground relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="inline-block font-heading font-black text-3xl tracking-widest text-foreground uppercase drop-shadow-[0_0_10px_rgba(255, 204, 0,0.5)]">
              <img src="/Transparent/logo white.png" alt="Aussie Rigs Arena" className="h-8" />
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              The ultimate destination for high-performance remote control vehicles. We stock the best RC cars, drones, boats, and parts from industry-leading manufacturers. Built for speed, engineered for durability.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="h-10 w-10 border border-white/10 flex items-center justify-center hover:border-racing-yellow hover:text-racing-yellow transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 border border-white/10 flex items-center justify-center hover:border-racing-yellow hover:text-racing-yellow transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 border border-white/10 flex items-center justify-center hover:border-racing-yellow hover:text-racing-yellow transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 border border-white/10 flex items-center justify-center hover:border-racing-yellow hover:text-racing-yellow transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-mono font-bold uppercase tracking-widest text-sm mb-6">Shop by Category</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products?category=rc-cars" className="hover:text-racing-yellow transition-colors">RC Cars & Trucks</Link></li>
              <li><Link href="/products?category=drones" className="hover:text-racing-yellow transition-colors">Drones & Multirotors</Link></li>
              <li><Link href="/products?category=rc-boats" className="hover:text-racing-yellow transition-colors">RC Boats</Link></li>
              <li><Link href="/products?category=rc-planes" className="hover:text-racing-yellow transition-colors">RC Planes</Link></li>
              <li><Link href="/products?category=electronics" className="hover:text-racing-yellow transition-colors">Batteries & Chargers</Link></li>
              <li><Link href="/products?category=parts" className="hover:text-racing-yellow transition-colors">Upgrades & Parts</Link></li>
            </ul>
          </div>

          {/* Helpful Links */}
          <div>
            <h3 className="text-white font-mono font-bold uppercase tracking-widest text-sm mb-6">Help & Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/help" className="hover:text-racing-yellow transition-colors">Help Center / FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-racing-yellow transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/returns" className="hover:text-racing-yellow transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/warranty" className="hover:text-racing-yellow transition-colors">Warranty Information</Link></li>
              <li><Link href="/part-finder" className="hover:text-racing-yellow transition-colors text-racing-yellow">RC Part Finder</Link></li>
              <li><Link href="/contact" className="hover:text-racing-yellow transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-mono font-bold uppercase tracking-widest text-sm mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-racing-yellow shrink-0" />
                <div>
                  <p className="text-white">1-800-AUS-RIGS</p>
                  <p className="text-xs mt-1">Mon-Fri: 9am - 6pm EST</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-racing-yellow shrink-0" />
                <a href="mailto:support@aussierigsarena.com" className="hover:text-white transition-colors">support@aussierigsarena.com</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-racing-yellow shrink-0" />
                <p>123 Horizon Drive<br/>Speedway City, SC 90210</p>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono">
          <p>© {new Date().getFullYear()} Aussie Rigs Arena. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
