import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface ProductBreadcrumbProps {
  product: any
}

export function ProductBreadcrumb({ product }: ProductBreadcrumbProps) {
  const category = product.category
  const parentCategory = category?.parent

  return (
    <nav className="flex items-center space-x-2 text-xs text-muted-foreground py-4 overflow-x-auto whitespace-nowrap px-4 md:px-8 max-w-7xl mx-auto w-full">
      <Link href="/" className="hover:text-primary transition-colors flex items-center">
        <Home className="w-3 h-3 mr-1" />
        <span className="sr-only">Home</span>
      </Link>
      
      <ChevronRight className="w-3 h-3 flex-shrink-0" />
      
      <Link href="/products" className="hover:text-primary transition-colors">
        Products
      </Link>
      
      {parentCategory && (
        <>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link href={`/products?category=${parentCategory.slug}`} className="hover:text-primary transition-colors">
            {parentCategory.name}
          </Link>
        </>
      )}

      {category && (
        <>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link href={`/products?category=${category.slug}`} className="hover:text-primary transition-colors">
            {category.name}
          </Link>
        </>
      )}
      
      <ChevronRight className="w-3 h-3 flex-shrink-0" />
      
      <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-[400px]">
        {product.name}
      </span>
    </nav>
  )
}
