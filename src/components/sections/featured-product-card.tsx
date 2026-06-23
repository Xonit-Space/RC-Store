import Link from "next/link"
import { Star, ShieldCheck, Zap, BatteryCharging, ShoppingCart } from "lucide-react"
import { CartIconButton } from "../product/cart-icon-button"

export function FeaturedProductCard() {
  return (
    <section className="bg-carbon-dark py-24 relative overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-racing-yellow/50 to-transparent" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="glass-dark border border-white/10 p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
          <Link href="/products/traxxas-x-maxx" className="absolute inset-0 z-10" aria-label="View Traxxas X-Maxx" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Image Side */}
            <div className="relative group">
              <div className="absolute inset-0 bg-racing-yellow/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full" />
              <img 
                src="https://images.unsplash.com/photo-1588612143093-4e44208d1326?q=80&w=2070" 
                alt="Traxxas X-Maxx 8S" 
                className="w-full h-auto object-cover relative z-10 scale-100 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 z-20 bg-racing-yellow text-carbon-dark font-mono font-bold text-[10px] tracking-widest px-3 py-1 uppercase shadow-[0_0_10px_rgba(255, 204, 0,0.5)]">
                Featured Build
              </div>
            </div>

            {/* Content Side */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-racing-yellow text-racing-yellow" />
                ))}
                <span className="text-xs font-mono text-muted-foreground ml-2">(128 Reviews)</span>
              </div>
              
              <h2 className="font-heading font-black text-4xl md:text-5xl text-foreground uppercase tracking-tight mb-4">
                Traxxas X-Maxx 8S <span className="text-racing-yellow">Brushless</span>
              </h2>
              
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-mono font-bold text-white">$1,099.95</span>
                <span className="text-sm font-mono text-muted-foreground line-through">$1,299.95</span>
              </div>
              
              <p className="text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Relentless 4X4 power, mammoth size, and award-winning innovation make X-Maxx the ultimate monster truck. Powered by extreme 8s LiPo muscle, it defies physics with brutal acceleration and 50+ mph speeds.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-racing-yellow" />
                  <span className="text-xs font-mono text-gray-300 uppercase">50+ MPH Top Speed</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-racing-yellow" />
                  <span className="text-xs font-mono text-gray-300 uppercase">Self-Righting Tech</span>
                </div>
                <div className="flex items-center gap-2">
                  <BatteryCharging className="w-5 h-5 text-racing-yellow" />
                  <span className="text-xs font-mono text-gray-300 uppercase">8S LiPo Compatible</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <CartIconButton className="relative z-20 flex-1 bg-racing-yellow text-carbon-dark font-heading font-black uppercase tracking-widest py-4 px-6 flex items-center justify-center gap-2 hover:bg-neon-yellow transition-colors shadow-[0_0_15px_rgba(255, 204, 0,0.3)] hover:shadow-[0_0_25px_rgba(255, 204, 0,0.6)]">
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </CartIconButton>
                <Link href="/products/traxxas-x-maxx" className="relative z-20 flex-1 border border-white/20 text-white font-heading font-bold uppercase tracking-widest py-4 px-6 flex items-center justify-center hover:bg-white/5 hover:border-racing-yellow/50 transition-colors">
                  View Specs
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
