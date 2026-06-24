import { db } from "@/lib/db"
import { ProductGender } from "@prisma/client"

export interface GetProductsFilters {
  category?: string
  gender?: ProductGender
  collection?: string
  brand?: string
  size?: string
  color?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: "newest" | "price_asc" | "price_desc" | "popular" | "rating"
  page?: number
  limit?: number
  isActive?: boolean
}

export async function getProducts(filters: GetProductsFilters) {
  const {
    category,
    gender,
    collection,
    brand,
    size,
    color,
    minPrice = 0,
    maxPrice,
    search,
    sort = "newest",
    page = 1,
    limit = 12,
    isActive = true,
  } = filters

  const skip = (page - 1) * limit

  // Construct dynamic Prisma where clause
  const where: any = {
    isActive,
    deletedAt: null,
    price: {
      gte: minPrice,
      ...(maxPrice && { lte: maxPrice }),
    },
    ...(gender && { gender }),
    ...(category && {
      category: {
        OR: [
          { slug: category },
          { parent: { slug: category } }, // Matches child categories as well
        ],
      },
    }),
    ...(collection && { collection: { slug: collection } }),
    ...(brand && { brand: { slug: brand } }),
    ...(size && {
      variants: {
        some: {
          size,
          isActive: true,
        },
      },
    }),
    ...(color && {
      variants: {
        some: {
          colorName: { contains: color, mode: "insensitive" },
          isActive: true,
        },
      },
    }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { name: { contains: search, mode: "insensitive" } } },
      ],
    }),
  }

  // Define sort orders
  let orderBy: any = { createdAt: "desc" }
  if (sort === "price_asc") {
    orderBy = { price: "asc" }
  } else if (sort === "price_desc") {
    orderBy = { price: "desc" }
  } else if (sort === "popular") {
    orderBy = { reviews: { _count: "desc" } } // Approximation based on review counts
  }

  // Execute database queries
  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        collection: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: { isActive: true },
        },
        _count: {
          select: { reviews: true }
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ])

  // Get aggregated reviews for the products on this page
  const productIds = products.map(p => p.id)
  const reviewStats = await db.review.groupBy({
    by: ['productId'],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
  })

  const ratingMap = new Map(reviewStats.map(stat => [stat.productId, stat._avg.rating ?? 0]))

  // Map to the final result
  const items = products.map((product) => {
    // Explicitly destructure out _count if needed to avoid sending it to the client, but it's fine as is
    const { _count, ...rest } = product
    return {
      ...rest,
      averageRating: ratingMap.get(product.id) ?? 0,
      reviewCount: product._count.reviews,
    }
  })

  return {
    items,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  }
}

export async function getProductBySlug(slug: string) {
  const [product, reviewStats] = await Promise.all([
    db.product.findUnique({
      where: { slug },
      include: {
        category: {
          include: { parent: true },
        },
        brand: true,
        collection: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: { isActive: true },
          include: { inventory: true },
        },
        attributes: true,
        // Limit reviews to most recent 20 — avoids full table load on high-review products
        reviews: {
          take: 20,
          include: {
            user: {
              select: { name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    // Use aggregate for accurate rating across ALL reviews, not just the 20 loaded
    db.review.aggregate({
      where: { product: { slug } },
      _avg: { rating: true },
      _count: { id: true },
    }),
  ])

  if (!product) return null

  return {
    ...product,
    averageRating: reviewStats._avg.rating ?? 0,
    reviewCount: reviewStats._count.id,
  }
}

export async function createProductReview(productId: string, userId: string, rating: number, comment?: string) {
  return db.review.create({
    data: {
      productId,
      userId,
      rating,
      comment,
    },
  })
}

// Cached for 1 hour — category trees change on admin action, not continuously
import { unstable_cache } from "next/cache"

export const getCategoriesTree = unstable_cache(
  async () => {
    return db.category.findMany({
      where: { parentId: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            children: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      },
    })
  },
  ["categories-tree"],
  { revalidate: 3600, tags: ["categories"] }
)
