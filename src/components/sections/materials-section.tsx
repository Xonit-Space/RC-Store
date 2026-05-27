import Link from "next/link"

const materials = [
  {
    name: "Mongolian Cashmere",
    origin: "Inner Mongolia",
    description: "Hand-combed from free-ranging goats in the Gobi highlands. Each kilogram takes one goat an entire season to produce.",
    texture: "bg-sand",
  },
  {
    name: "Washed Silk",
    origin: "Lyon, France",
    description: "Triple-washed to achieve an unparalleled drape and softness. Produced at the last artisan silk mill in Lyon.",
    texture: "bg-muted",
  },
  {
    name: "Merino Wool",
    origin: "New Zealand",
    description: "Ultra-fine 17.5-micron fibers, ethically sourced from farms with full traceability from pasture to garment.",
    texture: "bg-olive/30",
  },
  {
    name: "Japanese Selvedge Denim",
    origin: "Okayama, Japan",
    description: "Shuttle-loom woven at a Showa-era mill. Natural indigo aged to develop a unique patina over years of wear.",
    texture: "bg-forest/20",
  },
]

export function MaterialsSection() {
  return (
    <section className="py-24 md:py-40 bg-sand/30">
      <div className="container mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="mb-16 md:mb-24 max-w-lg">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
            The Source
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight text-foreground">
            Signature<br />
            <em style={{ fontStyle: "italic" }}>Materials</em>
          </h2>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/30">
          {materials.map((material) => (
            <div
              key={material.name}
              className={`${material.texture} p-10 md:p-14 group hover:bg-forest/10 transition-colors duration-500`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                      {material.origin}
                    </p>
                    <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground">
                      {material.name}
                    </h3>
                  </div>
                  <div className="w-8 h-px bg-border mt-4 group-hover:w-12 transition-all duration-500" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                  {material.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer link */}
        <div className="mt-16 text-center">
          <Link
            href="/materials"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-muted-foreground hover:text-accent transition-colors"
          >
            Our Full Materials Guide →
          </Link>
        </div>
      </div>
    </section>
  )
}
