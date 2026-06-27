import { getProductBySlugServer as getProductBySlug } from "@/lib/server-api"
import { ProductDetailClient } from "./product-detail-client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ProductBreadcrumb } from "@/components/product/product-breadcrumb"

// ISR: product detail pages revalidate every 5 minutes
export const revalidate = 300

interface ProductDetailPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Product Not Found" }
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | AUSSIE RIGS ARENA`,
      description: product.description,
      images: product.images?.length ? [product.images[0].url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.images?.length ? [product.images[0].url] : [],
    }
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = params
  const product = await getProductBySlug(slug)

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <p className="font-serif text-2xl text-foreground">Item Unavailable</p>
          <Link href="/products" className="text-[11px] tracking-[0.2em] uppercase text-accent border-b border-accent pb-1">
            Return to Catalog
          </Link>
        </div>
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aussierigs.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.length ? product.images.map((img: any) => img.url) : [],
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "AUSSIE RIGS ARENA"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/products/${product.slug}`,
      "priceCurrency": "AUD",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.variants?.some((v: any) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1 mt-20 md:mt-24">
        <ProductBreadcrumb product={product} />
        <ProductDetailClient product={product} />
      </main>
    </div>
  )
}
