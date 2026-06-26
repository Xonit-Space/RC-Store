"use client"

import { useState, useEffect } from "react"
import { Search, Map, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { getVehicleMakesAndModels } from "@/actions/landing-page"

export function PartFinderBanner() {
  const router = useRouter()
  const [makes, setMakes] = useState<any[]>([])
  const [makeId, setMakeId] = useState("")
  const [modelId, setModelId] = useState("")

  useEffect(() => {
    getVehicleMakesAndModels().then(data => {
      setMakes(data)
    })
  }, [])

  const selectedMake = makes.find(m => m.id === makeId)
  const models = selectedMake ? selectedMake.models : []

  return (
    <section className="relative bg-background py-24 border-t border-border overflow-hidden">
      {/* Background Image & Theme-aware Gradient */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1588612143093-4e44208d1326?q=80&w=2070')] bg-cover bg-center opacity-15 mix-blend-luminosity dark:opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent dark:from-background dark:via-background/90" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Form */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Precision Upgrades</p>
            </div>
            
            <h2 className="font-heading font-black text-4xl md:text-5xl text-foreground uppercase tracking-wider mb-6">
              Find the Exact <span className="text-transparent bg-clip-text bg-gradient-to-r from-racing-yellow to-neon-yellow">Hop-up Part</span>
            </h2>
            
            <p className="text-muted-foreground mb-10 max-w-lg leading-relaxed">
              Stop guessing. Select your vehicle to instantly see every compatible OEM replacement and aftermarket performance upgrade.
            </p>

            <div className="bg-background/50 backdrop-blur-sm border border-border p-6 md:p-8 flex flex-col sm:flex-row gap-4 mb-8">
              <select 
                value={makeId} 
                onChange={(e) => {
                  setMakeId(e.target.value)
                  setModelId("")
                }}
                className="flex-1 bg-muted border border-border text-foreground p-4 font-mono text-sm outline-none focus:border-racing-yellow transition-colors"
              >
                <option value="">Select Make</option>
                {makes.map(make => (
                  <option key={make.id} value={make.id}>{make.name}</option>
                ))}
              </select>

              <select 
                value={modelId} 
                onChange={(e) => setModelId(e.target.value)}
                disabled={!makeId}
                className="flex-1 bg-muted border border-border text-foreground p-4 font-mono text-sm outline-none focus:border-racing-yellow disabled:opacity-50 transition-colors"
              >
                <option value="">Select Model</option>
                {models.map((model: any) => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>

              <button 
                disabled={!modelId}
                onClick={() => router.push(`/part-finder?make=${makeId}&model=${modelId}`)}
                className="bg-primary text-primary-foreground font-heading font-black uppercase tracking-widest px-8 py-4 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(255, 204, 0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-5 h-5" />
                Find Parts
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 border-t border-border pt-8">
              <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Map className="w-5 h-5 text-primary" />
                <span className="font-mono text-xs uppercase tracking-widest">Exploded Diagrams</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <FileText className="w-5 h-5 text-primary" />
                <span className="font-mono text-xs uppercase tracking-widest">PDF Manuals</span>
              </div>
            </div>
          </div>
          
          {/* Right Column: Image Graphic */}
          <div className="hidden lg:flex justify-end relative h-full min-h-[400px] items-center">
             {/* Decorative Elements */}
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
             <div className="absolute right-20 top-20 w-40 h-40 bg-racing-yellow/10 rounded-full blur-2xl dark:bg-racing-yellow/10 bg-primary/20" />
             
             <div className="relative z-10 w-[90%] max-w-[600px] aspect-video border border-border/50 shadow-2xl skew-x-[-5deg] hover:skew-x-0 transition-transform duration-700 ease-in-out overflow-hidden rounded-md bg-muted">
               <img 
                 src="https://images.unsplash.com/photo-1588612143093-4e44208d1326?q=80&w=1200&auto=format&fit=crop" 
                 alt="RC Car Components" 
                 className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
               />
               {/* Overlay graphic */}
               <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
               <div className="absolute bottom-4 left-4 right-4 p-4 border border-border/40 bg-background/50 backdrop-blur-sm rounded-sm">
                 <div className="flex items-center justify-between">
                   <div className="space-y-1">
                     <div className="h-1 w-12 bg-primary rounded-full"></div>
                     <p className="text-[10px] font-mono text-foreground uppercase tracking-widest">System Scan Complete</p>
                   </div>
                   <span className="text-xs font-bold text-primary">100% Match</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
