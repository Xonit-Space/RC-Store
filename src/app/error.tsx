"use client"

import { useEffect } from "react"
import { AlertOctagon, RefreshCw, Home } from "lucide-react"

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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground font-sans">
      <div className="relative max-w-md w-full rounded-none bg-white/5 border border-white/10 backdrop-blur-xl p-8 text-center shadow-2xl overflow-hidden">
        {/* Decorative subtle ambient glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 mb-6">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          We encountered an unexpected error on our side. Please try reloading or head back to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all shadow-lg shadow-primary/20"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all border border-white/5"
          >
            <Home className="w-4 h-4" />
            Go Home
          </a>
        </div>

        {error.digest && (
          <div className="mt-8 pt-4 border-t border-white/5">
            <span className="text-xs text-gray-500 font-mono">Trace ID: {error.digest}</span>
          </div>
        )}
      </div>
    </div>
  )
}
