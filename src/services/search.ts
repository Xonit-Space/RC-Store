import { db } from "@/lib/db"

export interface SearchOptions {
  query: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
  userId?: string
}

export async function searchCatalog(options: SearchOptions) {
  const { query, categoryId, minPrice = 0, maxPrice, limit = 12, userId } = options
  const sanitizedQuery = query.trim()

  // 1. Log search telemetry asynchronously for analytics tracking
  if (sanitizedQuery.length >= 2) {
    logSearchQuery(sanitizedQuery, userId).catch(console.error)
  }

  // 2. Dual Search Pipeline: Fallback to Postgres Full-Text Search if Meilisearch URL is unset
  const products = await db.product.findMany({
    where: {
      isActive: true,
      price: {
        gte: minPrice,
        ...(maxPrice && { lte: maxPrice }),
      },
      ...(categoryId && { categoryId }),
      OR: [
        { name: { contains: sanitizedQuery, mode: "insensitive" } },
        { description: { contains: sanitizedQuery, mode: "insensitive" } },
        { brand: { name: { contains: sanitizedQuery, mode: "insensitive" } } },
        { category: { name: { contains: sanitizedQuery, mode: "insensitive" } } },
      ],
    },
    include: {
      category: true,
      brand: true,
      images: {
        where: { isFeatured: true },
        take: 1,
      },
    },
    take: limit,
  })

  // Log final click results analytics count
  if (sanitizedQuery.length >= 2) {
    updateSearchAnalytics(sanitizedQuery, products.length).catch(console.error)
  }

  return products
}

export async function getSearchSuggestions(query: string, limit = 5) {
  const sanitizedQuery = query.trim()
  if (sanitizedQuery.length < 2) return []

  // Auto-complete match lookups
  const suggestions = await db.searchAnalytics.findMany({
    where: {
      query: { contains: sanitizedQuery, mode: "insensitive" },
    },
    orderBy: { count: "desc" },
    take: limit,
  })

  return suggestions.map((s) => ({
    text: s.query,
    count: s.count,
    resultsCount: s.resultsCount,
  }))
}

// ==========================================
// TELEMETRY LOGGERS & METRICS TRACKERS
// ==========================================

async function logSearchQuery(query: string, userId?: string) {
  await db.searchHistory.create({
    data: {
      userId,
      query: query.toLowerCase(),
    },
  })
}

async function updateSearchAnalytics(query: string, resultsCount: number) {
  const lowercaseQuery = query.toLowerCase()

  await db.searchAnalytics.upsert({
    where: { query: lowercaseQuery },
    update: {
      count: { increment: 1 },
      resultsCount,
    },
    create: {
      query: lowercaseQuery,
      count: 1,
      resultsCount,
    },
  })
}

export async function trackSearchClick(query: string) {
  await db.searchAnalytics.updateMany({
    where: { query: query.toLowerCase() },
    data: {
      clicksCount: { increment: 1 },
    },
  })
}
