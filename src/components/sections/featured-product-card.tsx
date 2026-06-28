import { db } from "@/lib/db"
import { FeaturedProductSlider } from "./featured-product-slider"

export async function FeaturedProductCard() {
  const products = await db.product.findMany({
    where: { isFeatured: true, isActive: true },
    include: { images: true },
    take: 5
  })

  if (!products.length) return null

  // Process review stats for all products
  const productsWithStats = await Promise.all(
    products.map(async (product) => {
      const reviewStats = await db.review.aggregate({
        where: { productId: product.id },
        _avg: { rating: true },
        _count: { id: true }
      })
      
      return {
        ...product,
        rating: reviewStats._avg.rating || 5,
        reviewCount: reviewStats._count.id
      }
    })
  )

  return <FeaturedProductSlider products={productsWithStats} />
}
