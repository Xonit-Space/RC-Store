import Link from "next/link"
import { memo } from "react"
import { Star, Heart, Repeat } from "lucide-react"
import { CartIconButton } from "./cart-icon-button"
import { WishlistButton } from "./wishlist-button"

interface ProductCardProps {
  product: any;
  priority?: boolean;
}

export const ProductCard = memo(function ProductCard({ product, priority = false }: ProductCardProps) {
  // Handle different image formats (from DB relations or direct URLs)
  const image = typeof product.images?.[0] === 'string' 
    ? product.images[0] 
    : product.images?.[0]?.url 
      || "https://images.unsplash.com/photo-1594819047050-99defca82545?q=80&w=600";
      
  const rating = product.reviews?.length 
    ? (product.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / product.reviews.length).toFixed(1) 
    : "0.0";
  const reviewsCount = product.reviews?.length || 0;

  return (
    <div className="relative bg-muted border border-border hover:border-racing-yellow/30 group flex flex-col h-full overflow-hidden transition-colors">
      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`} />
      
      {/* Image Box */}
      <div className="relative aspect-square overflow-hidden bg-background/50 p-4">
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <WishlistButton productId={product.id} />
          <button className="relative z-20 w-8 h-8 bg-carbon-dark/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        <img 
          src={image} 
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          className="w-full h-full object-contain mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-110 transition-all duration-500"
        />
      </div>

      {/* Content Box */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-racing-yellow text-primary" />
          <span className="text-[10px] font-mono text-muted-foreground">{rating} ({reviewsCount})</span>
        </div>
        
        <Link 
          href={`/products/${product.slug}`} 
          className="relative z-20 font-heading font-bold text-lg text-foreground uppercase tracking-wide mb-4 hover:text-primary transition-colors line-clamp-2"
        >
          {product.name}
        </Link>
        
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-mono font-bold text-lg text-foreground">Rs. {product.price.toLocaleString()}</span>
          <CartIconButton 
            product={product} 
            className="relative z-20 w-10 h-10 bg-muted/50 border border-border flex items-center justify-center text-foreground hover:bg-racing-yellow hover:text-carbon-dark hover:border-primary transition-all"
          />
        </div>
      </div>
    </div>
  )
})
