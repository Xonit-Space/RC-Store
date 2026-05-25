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
        reviews: {
          select: { rating: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ])

  // Calculate review averages on the fly
  const items = products.map((product) => {
    const totalReviews = product.reviews.length
    const averageRating =
      totalReviews > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

    return {
      ...product,
      averageRating,
      reviewCount: totalReviews,
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
  const product = await db.product.findUnique({
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
      reviews: {
        include: {
          user: {
            select: { name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!product) return null

  const totalReviews = product.reviews.length
  const averageRating =
    totalReviews > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

  return {
    ...product,
    averageRating,
    reviewCount: totalReviews,
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

export async function getCategoriesTree() {
  return db.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: { children: true },
      },
    },
  })
}
