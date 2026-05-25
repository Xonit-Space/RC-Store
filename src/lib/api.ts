import { db } from "./db"

export async function getProducts(options?: {
  featured?: boolean
  categoryId?: string
  limit?: number
  search?: string
}) {
  const { featured, categoryId, limit, search } = options || {}

  const products = await db.product.findMany({
    where: {
      isActive: true,
      ...(featured && { isFeatured: true }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { tags: { has: search } },
        ],
      }),
    },
    include: {
      category: true,
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  })

  return products.map((product) => ({
    ...product,
    averageRating:
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
    reviewCount: product.reviews.length,
  }))
}

export async function getCategories() {
  return await db.category.findMany({
    include: {
      children: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  })
}

export async function getProductBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!product) return null

  return {
    ...product,
    averageRating:
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
    reviewCount: product.reviews.length,
  }
}

// Simulate AI recommendations
export async function getRecommendations(userId?: string) {
  // In a real app, this would use ML algorithms
  const products = await getProducts({ limit: 8 })

  return {
    personalized: products.slice(0, 2),
    trending: products.slice(2, 4),
    recentlyViewed: products.slice(4, 6),
  }
}
