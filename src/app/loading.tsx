export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0e0918] flex items-center justify-center p-6 text-white font-sans">
      <div className="relative max-w-sm w-full rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 text-center shadow-2xl overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#8b5cf6]/10 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#ec4899]/10 blur-3xl pointer-events-none animate-pulse" />

        {/* Dynamic spinning loader border wrapper */}
        <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#8b5cf6] animate-spin" />
          <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 border border-white/5 animate-ping" />
        </div>

        <h2 className="text-lg font-semibold tracking-wide text-gray-200 mb-1 animate-pulse">Loading NeoShop Ultra</h2>
        <p className="text-xs text-gray-400 font-mono tracking-wider animate-pulse">ESTABLISHING SECURE CONNECTION...</p>

        {/* Visual placeholders representing skeleton lines */}
        <div className="space-y-2 mt-8">
          <div className="h-2 bg-white/10 rounded-full w-3/4 mx-auto animate-pulse" />
          <div className="h-2 bg-white/5 rounded-full w-1/2 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}
