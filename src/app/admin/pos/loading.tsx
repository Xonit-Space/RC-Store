export default function POSLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="pb-4 border-b space-y-2">
        <div className="h-7 w-64 bg-muted rounded-none" />
        <div className="h-3 w-80 bg-muted rounded-none" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border/40 p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-muted shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-2 w-20 bg-muted" />
              <div className="h-5 w-12 bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Products grid */}
        <div className="xl:col-span-2 bg-card border border-border/40 p-4 space-y-4">
          <div className="h-9 w-full bg-muted" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-muted aspect-[3/4] rounded-none" />
            ))}
          </div>
        </div>

        {/* Cart panel */}
        <div className="xl:col-span-1 bg-card border border-border/40 p-4 space-y-4">
          <div className="h-5 w-32 bg-muted" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 border border-border/40 p-3">
                <div className="h-12 w-10 bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-full bg-muted" />
                  <div className="h-3 w-2/3 bg-muted" />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border/40 pt-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-muted" />
              <div className="h-4 w-16 bg-muted" />
            </div>
            <div className="h-12 w-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}
