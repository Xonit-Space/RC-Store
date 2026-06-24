import { describe, it, expect, vi } from "vitest"
import { formatPrice } from "@/config/i18n"
import { LoginSchema } from "@/validators/auth"

describe("Aussie Rigs Arena Enterprise Global Tests", () => {
  
  // 1. Validate locale-specific pricing transformations
  describe("i18n Multi-Currency Pricing Formatter", () => {
    it("should format USD base pricing correctly", () => {
      const formatted = formatPrice(100, "USD")
      expect(formatted).toContain("$")
      expect(formatted).toContain("100.00")
    })

    it("should format EUR exchange pricing correctly", () => {
      // 100 USD * 0.92 rate = 92.00 EUR
      const formatted = formatPrice(100, "EUR")
      expect(formatted).toContain("92,00")
      expect(formatted).toContain("€")
    })

    it("should fallback gracefully to USD base on unconfigured currencies", () => {
      const formatted = formatPrice(50, "XYZ")
      expect(formatted).toContain("$")
      expect(formatted).toContain("50.00")
    })
  })

  // 2. Validate strict Zod form inputs validations
  describe("Zod Authentication Validation Schemas", () => {
    it("should successfully parse valid login credentials", () => {
      const payload = {
        email: "demo@aussierigsarena.com",
        password: "secure_password_2026",
      }
      const result = LoginSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    it("should fail validation on invalid email targets", () => {
      const payload = {
        email: "invalid-email-address",
        password: "secure_password_2026",
      }
      const result = LoginSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })

    it("should fail validation on passwords shorter than 6 characters", () => {
      const payload = {
        email: "demo@aussierigsarena.com",
        password: "123",
      }
      const result = LoginSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })
  })
})
