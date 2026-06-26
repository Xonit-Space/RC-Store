import { Zap } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-6 animate-pulse">
        <p className="font-heading font-black text-4xl tracking-[0.2em] uppercase text-foreground drop-shadow-[0_0_10px_rgba(255, 204, 0,0.5)] flex items-center gap-2">
          <Zap className="w-8 h-8 text-primary" />
          SYSTEM BOOT
        </p>
        <div className="h-1 w-48 bg-primary shadow-[0_0_15px_rgba(255, 204, 0,0.8)]" />
      </div>
    </div>
  )
}
