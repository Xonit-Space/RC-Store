"use client"

import { useEffect } from "react"
import { AlertOctagon, RefreshCw, Home, ShieldAlert } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error securely to telemetry channels
    console.error("Root Application Error Boundary caught:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-carbon-dark flex items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-md w-full rounded-none glass-dark border border-racing-yellow/40 p-8 text-center shadow-[0_0_30px_rgba(255, 204, 0,0.15)] overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-racing-yellow to-transparent opacity-50" />

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-racing-yellow/10 border border-racing-yellow/30 text-racing-yellow mb-6 animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-heading font-black tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255, 204, 0,0.5)] mb-2">System Failure</h1>
        <p className="text-gray-400 font-mono text-sm mb-8 leading-relaxed uppercase">
          Telemetry stream disrupted. We encountered an unexpected fault in the core logic board.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-none bg-racing-yellow hover:bg-neon-yellow text-white font-heading font-black tracking-widest text-sm transition-all uppercase shadow-[0_0_15px_rgba(255, 204, 0,0.4)] hover:shadow-[0_0_30px_rgba(255, 204, 0,0.8)]"
          >
            <RefreshCw className="w-4 h-4" />
            Reboot Link
          </button>
          
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-none glass-dark hover:bg-white/5 text-white font-heading font-black tracking-widest text-sm transition-all border border-white/20 hover:border-racing-yellow/50 uppercase"
          >
            <Home className="w-4 h-4 text-racing-yellow" />
            Return to Base
          </a>
        </div>

        {error.digest && (
          <div className="mt-8 pt-4 border-t border-white/10">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">Diagnostic Code: {error.digest}</span>
          </div>
        )}
      </div>
    </div>
  )
}
