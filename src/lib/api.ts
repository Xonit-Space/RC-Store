// Client-safe API Client for browser components (no direct Prisma/db imports)

import { getCachedProducts, getCachedCategories } from "@/lib/services/product-service"

export interface ProductImage {
  url: string;
}

export interface ProductReview {
  rating: number;
}

export interface ApiProduct {
  id: string;
  name: string;
  price: number;
  slug: string;
  images?: ProductImage[];
  createdAt?: string;
  reviews?: ProductReview[];
  [key: string]: unknown;
}

export async function getProducts(options?: {
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
}) {
  if (typeof window === "undefined") {
    // Phase 2: Query DB directly via cached service if on the server
    return await getCachedProducts(options || {})
  }

  // Fallback to API route if called from client
  const { featured, categoryId, limit, search, category, brand, minPrice, maxPrice, sort, page, gender } = options || {}

  const params = new URLSearchParams()
  if (featured) params.set("featured", "true")
  if (categoryId) params.set("categoryId", categoryId)
  if (limit) params.set("limit", String(limit))
  if (search) params.set("q", search)
  if (category) params.set("category", category)
  if (brand) params.set("brand", brand)
  if (minPrice !== undefined) params.set("minPrice", String(minPrice))
  if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice))
  if (sort) params.set("sort", sort)
  if (page) params.set("page", String(page))
  if (gender) params.set("gender", gender)

  const baseUrl = typeof window === "undefined" ? (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000") : ""
  const res = await fetch(`${baseUrl}/api/products?${params.toString()}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error("Failed to fetch products catalog")

  const data = await res.json()
  
  // Format to standard product object signature with images as a string array
  return (data.data || []).map((product: ApiProduct) => ({
    ...product,
    images: product.images?.map((img: ProductImage) => img.url) || ["/placeholder.svg"],
    tags: product.createdAt && (new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ? ["new"] : [],
    averageRating: product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: ProductReview) => sum + r.rating, 0) / product.reviews.length
      : 0,
    reviewCount: product.reviews?.length || 0,
  }))
}

export async function getCategories() {
  if (typeof window === "undefined") {
    // Phase 2: Query DB directly via cached service if on the server
    return await getCachedCategories()
  }

  const baseUrl = typeof window === "undefined" ? (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000") : ""
  // We can call /api/products/categories
  const res = await fetch(`${baseUrl}/api/products/categories`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.data || []
}

export async function getProductBySlug(slug: string) {
  const baseUrl = typeof window === "undefined" ? (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000") : ""
  const res = await fetch(`${baseUrl}/api/products/slug/${slug}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  return await res.json()
}

export async function getRecommendations(userId?: string) {
  // Return standard mock/resolved recommendation structure using our client-safe catalog search
  try {
    const products = await getProducts({ limit: 8 })
    return {
      personalized: products.slice(0, 4),
      trending: products.slice(4, 8),
      recentlyViewed: products.slice(0, 4),
    }
  } catch (error) {
    console.error("Failed to load browser recommendations:", error)
    return { personalized: [], trending: [], recentlyViewed: [] }
  }
}
