import { describe, it, expect, vi, beforeEach } from "vitest"
import { checkCoupon } from "@/actions/order"
import { reserveStock } from "@/services/inventory"
import { db } from "@/lib/db"

vi.mock("@/lib/db", () => ({
  db: {
    coupon: {
      findUnique: vi.fn(),
    },
    inventory: {
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(db)),
    $queryRaw: vi.fn(),
  },
}))

describe("Pricing, Taxes and Coupons", () => {
  it("computes standard sales tax accurately", () => {
    const subtotal = 100
    const taxRate = 0.08
    const tax = Math.round(subtotal * taxRate * 100) / 100
    expect(tax).toBe(8.00)

    const complexSubtotal = 49.99
    const complexTax = Math.round(complexSubtotal * taxRate * 100) / 100
    expect(complexTax).toBe(4.00) // 49.99 * 0.08 = 3.9992 -> rounds to 4.00
  })

  describe("Coupon Discounts", () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it("applies percentage discount properly", async () => {
      const dummyCoupon = {
        id: "coup_123",
        code: "SUMMER20",
        isActive: true,
        startDate: new Date(Date.now() - 100000),
        endDate: new Date(Date.now() + 100000),
        usageLimit: 100,
        usedCount: 5,
        minOrderAmount: 50,
        discountType: "PERCENTAGE",
        discountValue: 20, // 20%
        maxDiscountAmount: 50,
      }

      vi.mocked(db.coupon.findUnique).mockResolvedValue(dummyCoupon as any)

      const result = await checkCoupon("SUMMER20", 100)
      expect(result.success).toBe(true)
      expect(result.data.discount).toBe(20)
    })

    it("respects maximum discount value caps", async () => {
      const dummyCoupon = {
        id: "coup_123",
        code: "SUMMER20",
        isActive: true,
        startDate: new Date(Date.now() - 100000),
        endDate: new Date(Date.now() + 100000),
        usageLimit: 100,
        usedCount: 5,
        minOrderAmount: 50,
        discountType: "PERCENTAGE",
        discountValue: 20, // 20% of 1000 is 200
        maxDiscountAmount: 30, // capped at 30
      }

      vi.mocked(db.coupon.findUnique).mockResolvedValue(dummyCoupon as any)

      const result = await checkCoupon("SUMMER20", 1000)
      expect(result.success).toBe(true)
      expect(result.data.discount).toBe(30)
    })

    it("rejects coupons past their expiration window", async () => {
      const expiredCoupon = {
        id: "coup_expired",
        code: "EXPIRED",
        isActive: true,
        startDate: new Date(Date.now() - 200000),
        endDate: new Date(Date.now() - 100000),
        usageLimit: 100,
        usedCount: 5,
        minOrderAmount: 10,
        discountType: "FIXED_AMOUNT",
        discountValue: 10,
      }

      vi.mocked(db.coupon.findUnique).mockResolvedValue(expiredCoupon as any)

      const result = await checkCoupon("EXPIRED", 50)
      expect(result.success).toBe(false)
      expect(result.error).toContain("expired")
    })
  })
})

describe("Inventory Transaction Locks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("successfully reserves stock when inventory is available", async () => {
    // Mock SELECT FOR UPDATE returned array
    vi.mocked(db.$queryRaw).mockResolvedValue([
      { id: "inv_123", quantity: 10, reserved: 2 }
    ])

    vi.mocked(db.inventory.update).mockResolvedValue({ id: "inv_123", reserved: 5 } as any)

    const result = await reserveStock({ variantId: "var_123", quantity: 3 })
    expect(result).toBeDefined()
    expect(db.$queryRaw).toHaveBeenCalled()
    expect(db.inventory.update).toHaveBeenCalledWith({
      where: { id: "inv_123" },
      data: {
        reserved: { increment: 3 }
      }
    })
  })

  it("throws error when requested stock exceeds current availability", async () => {
    // 10 total quantity, 8 already reserved -> only 2 available
    vi.mocked(db.$queryRaw).mockResolvedValue([
      { id: "inv_123", quantity: 10, reserved: 8 }
    ])

    // Requesting 3 units should fail
    await expect(reserveStock({ variantId: "var_123", quantity: 3 })).rejects.toThrow(
      "Requested stock size is currently unavailable"
    )
  })
})
