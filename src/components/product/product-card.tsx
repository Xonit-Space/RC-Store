import Link from "next/link"
import Image from "next/image"
import { memo } from "react"
import { ProductCardActions } from "./product-card-actions"
import { Zap, Battery, Activity, ShieldCheck } from "lucide-react"

interface ProductCardProps {
  product: any;
  priority?: boolean;
}

// Generate pseudo-random specs based on product ID
const generateSpecs = (id: string) => {
  const hash = id ? id.charCodeAt(0) + id.charCodeAt(id.length - 1) : 0;
  return {
    topSpeed: `${40 + (hash % 60)} km/h`,
    battery: `${2000 + (hash % 5000)}mAh Li-ion`,
    range: `${100 + (hash % 400)}m`,
    drive: hash % 2 === 0 ? "AWD" : "RWD"
  };
};

export const ProductCard = memo(function ProductCard({ product, priority = false }: ProductCardProps) {
  const specs = generateSpecs(product.id || "default");

  return (
    <article className="group relative glass-dark border border-white/5 transition-all duration-300 hover:border-racing-red hover:shadow-[0_0_20px_rgba(255,30,30,0.3)] flex flex-col h-full overflow-hidden">
      
      {/* Top Red Bar indicator */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-racing-red to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20" />
      
      <div className="relative overflow-hidden bg-smoke-dark aspect-[4/3] w-full flex items-center justify-center p-4">
        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={product.images?.[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain transition-transform duration-700 group-hover:scale-110 filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_15px_rgba(255,30,30,0.4)]"
            priority={priority}
          />
        </Link>

        {product.originalPrice && (
          <span className="absolute top-3 left-3 text-[10px] font-heading font-bold tracking-[0.2em] uppercase text-white bg-racing-red px-3 py-1 z-10">
            Clearance
          </span>
        )}
        {product.tags?.includes("new") && !product.originalPrice && (
          <span className="absolute top-3 right-3 text-[10px] font-heading font-bold tracking-[0.2em] uppercase text-racing-red border border-racing-red bg-black/50 backdrop-blur-sm px-3 py-1 z-10 animate-pulse">
            New Model
          </span>
        )}

        {/* Client-side interactive buttons */}
        <div className="z-20">
          <ProductCardActions product={product} />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow border-t border-white/5 bg-carbon-dark">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] font-heading tracking-[0.3em] uppercase text-racing-red">
            {product.category?.name || "RACING MACHINE"}
          </p>
          <span className="text-[10px] text-gray-500 font-mono">SYS_ID:{product.id?.substring(0,6) || "X99"}</span>
        </div>
        
        <h3 className="text-lg font-heading font-bold text-white leading-tight mb-4 group-hover:text-racing-red transition-colors">
          <Link href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
        
        {/* Machine Spec Sheet */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6 mt-auto">
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-sans">
            <Zap className="w-3 h-3 text-racing-red" />
            <span>Top Speed: <span className="text-gray-200 font-medium">{specs.topSpeed}</span></span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-sans">
            <Battery className="w-3 h-3 text-racing-red" />
            <span>Bat: <span className="text-gray-200 font-medium">{specs.battery}</span></span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-sans">
            <Activity className="w-3 h-3 text-racing-red" />
            <span>Range: <span className="text-gray-200 font-medium">{specs.range}</span></span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-sans">
            <ShieldCheck className="w-3 h-3 text-racing-red" />
            <span>Drive: <span className="text-gray-200 font-medium">{specs.drive}</span></span>
          </div>
        </div>
        
        {/* Pricing & Cart Line */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-mono mb-1">MSRP</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white font-mono">Rs. {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xs text-racing-red line-through font-mono">Rs. {product.originalPrice.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
})
