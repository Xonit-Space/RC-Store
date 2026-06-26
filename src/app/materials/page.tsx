import Image from "next/image"

export default function MaterialsPage() {
  const materials = [
    {
      name: "Organic Heavyweight Cotton",
      origin: "Wakayama, Japan",
      description: "Knit slowly on vintage loopwheel machines, this 400gsm cotton develops a unique patina over time while maintaining its structural integrity without tension or stress on the yarn.",
      image: "/placeholder.svg"
    },
    {
      name: "Cold-Washed Silk",
      origin: "Como, Italy",
      description: "Sourced from historic mills, our silk undergoes a specialized cold-washing process that removes the traditional high-gloss sheen, resulting in a matte, architectural drape.",
      image: "/placeholder.svg"
    },
    {
      name: "Technical Gabardine",
      origin: "Prato, Italy",
      description: "A water-resistant, densely woven worsted fabric that offers protection against the elements while maintaining a refined, tailored appearance suitable for formal environments.",
      image: "/placeholder.svg"
    }
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
            <main className="flex-1 pt-32 pb-24">
        
        <div className="px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto w-full mb-24 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Sourcing</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-foreground max-w-3xl mx-auto leading-tight">
            An uncompromising approach to raw materials.
          </h1>
        </div>

        <div className="space-y-px bg-border/30">
          {materials.map((material, index) => (
            <section key={index} className="bg-background">
              <div className="px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto w-full py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
                <div className="md:col-span-5 space-y-6">
                  <div className="flex items-center gap-4 text-[10px] tracking-[0.2em] uppercase font-bold">
                    <span className="text-foreground">0{index + 1}</span>
                    <span className="w-8 h-px bg-border/60"></span>
                    <span className="text-muted-foreground">{material.origin}</span>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground">
                    {material.name}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {material.description}
                  </p>
                </div>
                <div className="md:col-span-7">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/20">
                    <Image
                      src={material.image}
                      alt={material.name}
                      fill
                      className="object-cover object-center grayscale opacity-80"
                    />
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

      </main>
          </div>
  )
}
