import { Star, Truck, Box, Headphones } from "lucide-react"

export function TrustHighlights() {
  const highlights = [
    {
      icon: <Star className="w-8 h-8 text-racing-yellow" />,
      title: "4.9/5 Store Rating",
      description: "Based on 10,000+ verified customer reviews."
    },
    {
      icon: <Truck className="w-8 h-8 text-racing-yellow" />,
      title: "Lightning Delivery",
      description: "Free express shipping on orders over $150."
    },
    {
      icon: <Box className="w-8 h-8 text-racing-yellow" />,
      title: "25,000+ Parts in Stock",
      description: "The largest inventory of OEM and upgrade parts."
    },
    {
      icon: <Headphones className="w-8 h-8 text-racing-yellow" />,
      title: "Expert Support",
      description: "Lifetime tech support from actual RC hobbyists."
    }
  ]

  return (
    <section className="bg-smoke-dark py-16 border-y border-white/5">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-carbon-dark border border-white/10 flex items-center justify-center mb-6 group-hover:border-racing-yellow transition-colors group-hover:shadow-[0_0_20px_rgba(255, 204, 0,0.2)]">
                {item.icon}
              </div>
              <h3 className="text-white font-heading font-black uppercase tracking-wider mb-2 group-hover:text-racing-yellow transition-colors">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
