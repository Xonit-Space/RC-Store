export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-6 animate-pulse">
        <p className="font-serif text-3xl tracking-widest text-foreground opacity-50">
          NEOSHOP
        </p>
        <div className="h-[1px] w-12 bg-muted-foreground/30" />
      </div>
    </div>
  )
}
