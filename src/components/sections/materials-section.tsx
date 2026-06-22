import Link from "next/link"

const performanceStats = [
  {
    name: "Top Speed: 100+ KM/H",
    origin: "High RPM Output",
    description: "Sensored brushless technology delivering instantaneous torque and extreme straight-line velocity.",
    texture: "bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-background",
  },
  {
    name: "100C LiPo Power",
    origin: "High-Discharge Battery",
    description: "Advanced Lithium Polymer cells for sustained, fade-free racing performance and rapid acceleration.",
    texture: "bg-slate-100 dark:bg-smoke-dark",
  },
  {
    name: "1000m Control Range",
    origin: "Telemetry Link",
    description: "Zero-latency 2.4GHz transmission system ensuring flawless connection on massive outdoor tracks.",
    texture: "bg-graphite",
  },
  {
    name: "Carbon Fiber Chassis",
    origin: "Ultra-Lightweight Build",
    description: "Aerospace-grade woven carbon fiber provides maximum rigidity while shedding crucial grams.",
    texture: "bg-carbon-gray",
  },
]

export function MaterialsSection() {
  return (
    <section className="py-24 md:py-40 bg-background border-t border-border relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-racing-yellow/5 to-transparent pointer-events-none" />
      <div className="container mx-auto px-6 md:px-12 relative z-10">

        {/* Header */}
        <div className="mb-16 md:mb-24 max-w-lg fade-up-section visible">
          <p className="text-[12px] font-heading font-bold tracking-[0.3em] uppercase text-racing-yellow mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-racing-yellow rounded-full animate-ping" />
            Performance Output
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-black leading-tight text-foreground dark:text-white uppercase tracking-tighter">
            Tech <span className="text-racing-yellow">Specs</span>
          </h2>
        </div>

        {/* Performance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 shadow-[0_0_30px_rgba(255, 204, 0,0.1)]">
          {performanceStats.map((stat, i) => (
            <div
              key={stat.name}
              className={`${stat.texture} p-10 md:p-14 group hover:bg-racing-yellow/10 transition-colors duration-500 relative overflow-hidden fade-up-section visible`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-carbon-dark/80 to-transparent pointer-events-none" />
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-racing-yellow mb-2">
                      SYS_SPEC // {stat.origin}
                    </p>
                    <h3 className="font-heading text-2xl md:text-3xl font-black text-foreground dark:text-white uppercase tracking-tight group-hover:text-racing-yellow transition-colors">
                      {stat.name}
                    </h3>
                  </div>
                  <div className="w-8 h-[2px] bg-white/20 mt-4 group-hover:w-16 group-hover:bg-racing-yellow transition-all duration-500 shadow-[0_0_10px_rgba(255, 204, 0,0)] group-hover:shadow-[0_0_10px_rgba(255, 204, 0,0.8)]" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm font-sans">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer link */}
        <div className="mt-16 text-center fade-up-section visible">
          <Link
            href="/materials"
            className="inline-flex items-center gap-3 text-[12px] font-heading font-bold tracking-[0.25em] uppercase text-muted-foreground hover:text-racing-yellow hover:shadow-[0_0_15px_rgba(255, 204, 0,0.5)] transition-all bg-slate-100 dark:bg-smoke-dark px-6 py-3 border border-border hover:border-racing-yellow"
          >
            Specs Overview →
          </Link>
        </div>
      </div>
    </section>
  )
}
