import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-foreground", sizeClasses[size])} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Logo — extra padding wrapper prevents cropping from CSS scale transform */}
        <div style={{ padding: "28px 56px" }}>
          <img
            src="/Transparent/logo yellow0.png"
            alt="Aussie Rigs Arena"
            className="h-10 w-auto object-contain"
            style={{ transform: "scale(2.5)", transformOrigin: "center" }}
          />
        </div>
        {/* Slim sliding progress bar — no glow */}
        <div className="w-40 h-px bg-border/30 overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{
              width: "40%",
              animation: "pageload-slide 1.2s ease-in-out infinite",
            }}
          />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  )
}
