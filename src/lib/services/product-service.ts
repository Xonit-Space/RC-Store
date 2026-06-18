import { db } from "@/lib/db"
import { unstable_cache } from "next/cache"

export interface GetProductsOptions {
  featured?: boolean
  categoryId?: string
  limit?: number
  search?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  page?: number
  gender?: string
}

async function getProductsFromDb(options: GetProductsOptions = {}) {
  const { featured, categoryId, limit = 24, search, category, brand, minPrice = 0, maxPrice = 999999, sort, page = 1, gender } = options

  const where: any = {
    isActive: true,
    price: { gte: minPrice, lte: maxPrice },
  }
  if (category) where.category = { slug: category }
  if (categoryId) where.categoryId = categoryId
  if (brand) where.brand = { slug: brand }
  if (featured) where.isFeatured = true
  if (gender) where.gender = gender
  if (search) {
    // Phase 4: Full-Text Search (FTS) using PostgreSQL
    // Convert search terms to an FTS query format (e.g., 'term1 | term2')
    const searchQuery = search.split(/\s+/).filter(Boolean).join(" | ")
    where.OR = [
      { name: { search: searchQuery } },
      { description: { search: searchQuery } },
    ]
  }

  const skip = (page - 1) * limit
  
  // Phase 2: Use select instead of include to prevent N+1 and massive payloads
  const products = await db.product.findMany({
    where,
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      originalPrice: true,
      createdAt: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: { url: true }
      },
      category: {
        select: { name: true, slug: true }
      },
      variants: {
        where: { isActive: true },
        select: { id: true, size: true, color: true, price: true }
      },
      _count: {
        select: { reviews: true }
      }
    },
    orderBy: { createdAt: "desc" },
  })

  // Format to standard product object signature
  return products.map((product) => ({
    ...product,
    images: product.images?.map((img) => img.url) || ["/placeholder.svg"],
    tags: product.createdAt && (new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ? ["new"] : [],
    reviewCount: product._count.reviews,
  }))
}

// Cached version of getProducts
export async function getCachedProducts(options: GetProductsOptions = {}) {
  const {
    featured = false,
    categoryId = "",
    limit = 24,
    search = "",
    category = "",
    brand = "",
    minPrice = 0,
    maxPrice = 999999,
    sort = "",
    page = 1,
    gender = "",
  } = options

  const keyParts = [
    "products-catalog",
    `featured-${featured}`,
    `categoryId-${categoryId}`,
    `limit-${limit}`,
    `search-${search}`,
    `category-${category}`,
    `brand-${brand}`,
    `minPrice-${minPrice}`,
    `maxPrice-${maxPrice}`,
    `sort-${sort}`,
    `page-${page}`,
    `gender-${gender}`,
  ]

  const fetcher = unstable_cache(
    async () => getProductsFromDb(options),
    keyParts,
    {
      revalidate: 60 * 5, // Cache for 5 minutes
      tags: ['products']
    }
  )

  return fetcher()
}

export const getCachedCategories = unstable_cache(
  async () => {
    return await db.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, description: true, image: true }
    })
  },
  ['categories-list'],
  { revalidate: 60 * 60, tags: ['categories'] } // Cache for 1 hour
)
