export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-6 animate-pulse">
        <div className="flex items-center justify-center h-48 md:h-64 w-full px-8">
          <img 
            src="/Transparent/logo yellow0.png" 
            alt="Aussie Rigs Arena Loading..." 
            className="h-full max-w-full object-contain drop-shadow-[0_0_10px_rgba(255,204,0,0.5)] pointer-events-none" 
          />
        </div>
        <div className="h-1 w-48 bg-primary shadow-[0_0_15px_rgba(255,204,0,0.8)] mt-8" />
      </div>
    </div>
  )
}
