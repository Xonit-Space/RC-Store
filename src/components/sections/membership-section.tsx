"use client"

import Link from "next/link"
import { ArrowRight, Trophy } from "lucide-react"

const perks = [
  { label: "Early Model Access", detail: "Pre-order new chassis and kits 48 hours before public release" },
  { label: "Custom Tuning Support", detail: "Direct line to our engineers for setup sheets and telemetry analysis" },
  { label: "Track Day Events", detail: "Exclusive invites to VIP racing events and meetups" },
  { label: "Beta Firmware", detail: "First access to experimental ESC and controller firmware updates" },
]

export function MembershipSection() {
  return (
    <section className="py-24 md:py-40 bg-background text-foreground dark:text-white overflow-hidden relative border-t border-border">
      {/* Dynamic Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
        aria-hidden="true"
      />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-racing-red/10 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid md:grid-cols-12 gap-12 md:gap-20 items-start">

          {/* Left — Manifesto */}
          <div className="md:col-span-5 space-y-10 fade-up-section visible">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-racing-red" />
                <p className="text-[12px] font-heading font-bold tracking-[0.35em] uppercase text-racing-red">
                  Elite Access
                </p>
              </div>
              <h2 className="font-heading text-4xl md:text-6xl font-black leading-[1.05] tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,30,30,0.3)]">
                Pro Racing<br />
                <span className="text-racing-red">League</span>
              </h2>
            </div>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm glass-dark p-4 border-l-2 border-racing-red">
              Reserved for pilots who demand the absolute best. Gain access to elite engineering support, beta firmware, and VIP track events.
            </p>

            <Link
              href="/membership"
              id="membership-cta"
              className="inline-flex items-center justify-center gap-3 bg-racing-red text-foreground dark:text-white px-8 py-4 font-heading font-bold tracking-widest uppercase hover:bg-neon-red transition-all duration-300 shadow-[0_0_15px_rgba(255,30,30,0.4)] hover:shadow-[0_0_30px_rgba(255,30,30,0.8)] border border-racing-red hover:scale-105 group"
            >
              Apply For Pro License
              <ArrowRight strokeWidth={2} className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {/* Right — Perks List */}
          <div className="md:col-span-7 fade-up-section visible">
            <div className="divide-y divide-white/10 glass-dark p-8 border border-border shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              {perks.map((perk, i) => (
                <div key={perk.label} className="py-6 flex gap-6 group cursor-default hover:bg-white/5 transition-colors p-4 -mx-4 rounded-lg">
                  <span className="text-[14px] font-heading font-black tracking-[0.2em] text-racing-red/50 mt-1 shrink-0 w-8 group-hover:text-racing-red transition-colors drop-shadow-[0_0_5px_rgba(255,30,30,0)] group-hover:drop-shadow-[0_0_10px_rgba(255,30,30,0.8)]">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-heading text-xl md:text-2xl font-bold mb-2 group-hover:text-foreground dark:text-white text-gray-200 uppercase tracking-tight transition-colors duration-300">
                      {perk.label}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                      {perk.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
