import Link from "next/link"

export function BrandShowcase() {
  // Using text placeholders styled nicely since we don't have logo SVGs
  const brands = [
    "TRAXXAS", "ARRMA", "LOSI", "TEAM ASSOCIATED", "AXIAL", 
    "KYOSHO", "TAMIYA", "REDCAT", "HOBBYWING", "SPEKTRUM"
  ]

  return (
    <section className="bg-background py-16 border-y border-border overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 mb-8 flex justify-between items-end">
        <div>
          <h2 className="font-heading font-black text-2xl text-foreground uppercase tracking-widest">
            Premium Manufacturers
          </h2>
        </div>
        <Link href="/brands" className="text-xs font-mono font-bold tracking-widest text-primary hover:text-foreground/80 dark:hover:text-white uppercase transition-colors">
          View All Brands
        </Link>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        {/* Left Gradient Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        
        {/* Marquee Container */}
        <div className="flex animate-marquee whitespace-nowrap">
          {[...brands, ...brands, ...brands].map((brand, i) => (
            <div 
              key={i} 
              className="mx-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:text-primary transition-all duration-300 cursor-pointer text-3xl font-heading font-black tracking-widest text-foreground border-x border-border px-8 flex items-center"
            >
              {brand}
            </div>
          ))}
        </div>
        
        {/* Right Gradient Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}} />
    </section>
  )
}
