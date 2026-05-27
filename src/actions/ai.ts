"use server"

import { db } from "@/lib/db"
import { AiService } from "@/services/ai"
import { ActionResponse } from "./auth"

export async function getPersonalizedFeed(userId?: string, limit = 4): Promise<ActionResponse> {
  try {
    // 1. Fetch scored recommendation product IDs
    const scores = await AiService.getPersonalizedFeed(userId, limit)
    const productIds = scores.map((s) => s.productId)

    if (productIds.length === 0) {
      // Fallback: return featured items if no recommendation is found
      const fallbackProducts = await db.product.findMany({
        where: { isActive: true },
        include: {
          category: true,
          images: { where: { isFeatured: true }, take: 1 },
        },
        take: limit,
      })
      return { success: true, data: fallbackProducts }
    }

    // 2. Query fully resolved products matching the recommendations list
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
        images: { where: { isFeatured: true }, take: 1 },
        reviews: { select: { rating: true } },
      },
    })

    // 3. Map scores and reviews averages to the products
    const resolvedProducts = products.map((product) => {
      const match = scores.find((s) => s.productId === product.id)
      const reviewCount = product.reviews.length
      const averageRating =
        reviewCount > 0 ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0

      return {
        ...product,
        aiScore: match?.score || 0.5,
        aiReasons: match?.reasons || [],
        averageRating,
        reviewCount,
      }
    })

    // Sort by AI score descending
    resolvedProducts.sort((a, b) => b.aiScore - a.aiScore)

    return { success: true, data: resolvedProducts }
  } catch (error: any) {
    console.error("AI Personalized Feed Server Action Error:", error)
    return { success: false, error: "Failed to load AI recommendations" }
  }
}

export async function getOutfitStylingAdvice(productId: string): Promise<ActionResponse> {
  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { category: true },
    })

    if (!product) {
      return { success: false, error: "Product not found" }
    }

    const advice = await AiService.generateStylingAdvice(product.name, product.category.name)

    return { success: true, data: advice }
  } catch (error: any) {
    console.error("AI Styling Advice Server Action Error:", error)
    return { success: false, error: "Failed to generate AI styling advice" }
  }
}
