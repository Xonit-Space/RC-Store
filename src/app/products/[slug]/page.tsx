import { getProductBySlugServer as getProductBySlug } from "@/lib/server-api"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductDetailClient } from "./product-detail-client"
import { notFound } from "next/navigation"
import Link from "next/link"

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
    title: `${product.name} | NeoShop Ultra`,
    description: product.description,
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = params
  const product = await getProductBySlug(slug)

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <p className="font-serif text-2xl text-foreground">Item Unavailable</p>
          <Link href="/products" className="text-[11px] tracking-[0.2em] uppercase text-accent border-b border-accent pb-1">
            Return to Catalog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 mt-20 md:mt-0">
        <ProductDetailClient product={product} />
      </main>
      <Footer />
    </div>
  )
}
