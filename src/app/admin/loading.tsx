export default function AdminLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Page title skeleton */}
      <div className="space-y-3">
        <div className="h-3 w-24 bg-muted rounded-none" />
        <div className="h-10 w-56 bg-muted rounded-none" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 md:p-8 bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 space-y-8">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 bg-muted rounded-none" />
              <div className="h-3 w-16 bg-muted rounded-none" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-20 bg-muted rounded-none" />
              <div className="h-8 w-32 bg-muted rounded-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Two column content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="h-6 w-48 bg-muted rounded-none border-b border-border/40 pb-4" />
          <div className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 p-8 space-y-4">
            <div className="h-4 w-full bg-muted rounded-none" />
            <div className="h-4 w-3/4 bg-muted rounded-none" />
            <div className="h-4 w-1/2 bg-muted rounded-none" />
          </div>
        </div>
        <div className="lg:col-span-5 space-y-4">
          <div className="h-6 w-48 bg-muted rounded-none border-b border-border/40 pb-4" />
          <div className="bg-white dark:bg-background border border-border/40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 divide-y divide-border/40">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-5 flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-muted rounded-none" />
                  <div className="h-3 w-24 bg-muted rounded-none" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-3 w-16 bg-muted rounded-none ml-auto" />
                  <div className="h-4 w-20 bg-muted rounded-none ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
