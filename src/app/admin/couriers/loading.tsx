export default function CouriersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="pb-4 border-b space-y-2">
        <div className="h-7 w-72 bg-muted rounded-none" />
        <div className="h-3 w-96 bg-muted rounded-none" />
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

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Courier roster */}
        <div className="xl:col-span-1 bg-card border border-border/40 p-4 space-y-3 h-[520px]">
          <div className="h-5 w-32 bg-muted" />
          <div className="h-9 w-full bg-muted" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-border/40 p-3 space-y-2">
                <div className="h-3 w-3/4 bg-muted" />
                <div className="h-3 w-1/2 bg-muted" />
                <div className="flex gap-2">
                  <div className="h-4 w-16 bg-muted rounded-full" />
                  <div className="h-4 w-24 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch log */}
        <div className="xl:col-span-2 bg-card border border-border/40 p-4 h-[520px] space-y-3">
          <div className="h-5 w-40 bg-muted" />
          <div className="flex gap-2">
            <div className="h-9 flex-1 bg-muted" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-9 w-24 bg-muted" />
              ))}
            </div>
          </div>
          <div className="space-y-0 border-t border-border/40 pt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border/40">
                <div className="space-y-1">
                  <div className="h-3 w-28 bg-muted" />
                  <div className="h-3 w-20 bg-muted" />
                </div>
                <div className="space-y-1 text-center">
                  <div className="h-3 w-24 bg-muted" />
                  <div className="h-3 w-16 bg-muted" />
                </div>
                <div className="h-3 w-20 bg-muted" />
                <div className="h-5 w-20 bg-muted rounded-full" />
                <div className="h-7 w-7 bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
