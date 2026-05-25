import { describe, it, expect, vi } from "vitest"
import { AiService } from "@/services/ai"

// Enterprise Isolation Pattern: Mock the Prisma database singleton
vi.mock("@/lib/db", () => {
  return {
    db: {
      product: {
        findMany: vi.fn().mockResolvedValue([
          { id: "prod-1", categoryId: "cat-men-streetwear", price: 245.0 },
          { id: "prod-2", categoryId: "cat-men-apparel", price: 165.0 },
        ]),
      },
      recommendationEvent: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
  }
})

describe("Neoshop Enterprise AI Commerce Engine Tests", () => {

  // 1. Verify that coordinate styling advice is parsed or fallback is returned
  describe("OpenAI Prompt Orchestration - Styling Coordinates", () => {
    it("should return a premium fashion coordinates description string", async () => {
      const advice = await AiService.generateStylingAdvice("Premium Utility Bomber", "Streetwear")
      expect(typeof advice).toBe("string")
      expect(advice.length).toBeGreaterThan(15)
      expect(advice.toLowerCase()).toContain("trouser") // Verify fashion terms presence
    })
  })

  // 2. Verify that the dense vector embeddings array compiles exactly (1536 dimensions)
  describe("Vector DB & Embeddings Adapter (1536 dims)", () => {
    it("should return a dense float vector containing exactly 1536 items", async () => {
      const embedding = await AiService.generateQueryEmbedding("linen streetwear cargos")
      expect(Array.isArray(embedding)).toBe(true)
      expect(embedding.length).toBe(1536)
      expect(typeof embedding[0]).toBe("number")
    })
  })

  // 3. Verify hybrid recommendation baseline scoring
  describe("Dynamic Hybrid Recommendation Scoring", () => {
    it("should return a default recommendation score mapping for anonymous users", async () => {
      const scores = await AiService.getPersonalizedFeed(undefined, 2)
      expect(Array.isArray(scores)).toBe(true)
      expect(scores.length).toBe(2)
      expect(scores[0]).toHaveProperty("productId")
      expect(scores[0]).toHaveProperty("score")
      expect(scores[0]).toHaveProperty("reasons")
      expect(typeof scores[0].score).toBe("number")
      expect(scores[0].productId).toBe("prod-1") // High-value bomber boost
    })
  })
})
