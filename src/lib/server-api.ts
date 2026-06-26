import "server-only"
import { getProducts as repoGetProducts, getProductBySlug as repoGetProductBySlug } from "@/repositories/product"
import { serializeForClient } from "@/lib/serialize"

export async function getProductsServer(options?: any) {
  const res = await repoGetProducts(options)
  return res.items.map((product: any) =>
    serializeForClient({
      ...product,
      images: product.images?.map((img: any) => img.url) || ["/placeholder.svg"],
      tags: product.createdAt && (new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ? ["new"] : [],
    })
  )
}

export async function getProductBySlugServer(slug: string) {
  const product = await repoGetProductBySlug(slug)
  if (!product) return null
  return serializeForClient({
    ...product,
    images: (product as any).images?.map((img: any) => img.url) || ["/placeholder.svg"],
    tags: (product as any).createdAt && (new Date((product as any).createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ? ["new"] : [],
  })
}
