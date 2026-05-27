"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

const perks = [
  { label: "First Access", detail: "New collections 48 hours before public release" },
  { label: "Complimentary Alterations", detail: "Lifetime tailoring on all full-price garments" },
  { label: "Private Events", detail: "Exclusive atelier previews and trunk shows" },
  { label: "Concierge Styling", detail: "Personal stylist sessions by appointment" },
]

export function MembershipSection() {
  return (
    <section className="py-24 md:py-40 bg-forest text-off-white overflow-hidden relative">
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(246,243,238,0.5) 24px, rgba(246,243,238,0.5) 25px)`,
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-6 md:px-12 relative">
        <div className="grid md:grid-cols-12 gap-12 md:gap-20 items-start">

          {/* Left — Manifesto */}
          <div className="md:col-span-5 space-y-10">
            <div>
              <p className="text-[10px] tracking-[0.35em] uppercase text-sand/70 mb-6">
                Private Membership
              </p>
              <h2 className="font-serif text-4xl md:text-6xl font-light leading-[1.05] tracking-tight">
                The Inner<br />
                <em style={{ fontStyle: "italic" }}>Circle</em>
              </h2>
            </div>

            <p className="text-sm md:text-base text-sand/80 leading-relaxed max-w-sm">
              Reserved for those who understand that the finest things in life are never announced — they are simply known.
            </p>

            <Link
              href="/membership"
              id="membership-cta"
              className="inline-flex items-center gap-3 text-[11px] tracking-[0.25em] uppercase text-sand border-b border-sand/40 pb-1 hover:border-brass hover:text-brass transition-all duration-300 group"
            >
              Apply for Membership
              <ArrowRight strokeWidth={1} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right — Perks List */}
          <div className="md:col-span-7">
            <div className="divide-y divide-off-white/10">
              {perks.map((perk, i) => (
                <div key={perk.label} className="py-8 flex gap-8 group cursor-default">
                  <span className="text-[10px] tracking-[0.2em] text-sand/40 mt-1 shrink-0 w-6">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl font-light mb-2 group-hover:text-brass transition-colors duration-300">
                      {perk.label}
                    </h3>
                    <p className="text-sm text-sand/60 leading-relaxed">
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
