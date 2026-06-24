"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-8">
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif tracking-tight text-foreground font-light">AUSSIE RIGS ARENA</h1>
          </Link>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-[400px]">
          <div className="bg-background py-10 px-8 md:px-10 border border-border/40 shadow-sm flex flex-col items-center text-center">
            <ShieldAlert className="h-16 w-16 text-red-500 mb-6" />
            <h2 className="text-xl font-bold font-serif mb-2 text-foreground">Access Denied</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest leading-relaxed mb-8">
              You do not have the required permissions to access this area.
            </p>
            <Link 
              href="/"
              className="w-full h-12 flex items-center justify-center bg-foreground text-background hover:bg-foreground/90 font-bold text-xs tracking-widest uppercase transition-all"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
