import { describe, it, expect } from "vitest"
import { validateOrderTransition } from "@/lib/security/state-machine"
import { OrderStatus } from "@prisma/client"

describe("Order State Machine", () => {
  it("allows correct transitions", () => {
    // Standard progression
    expect(validateOrderTransition(OrderStatus.PENDING, OrderStatus.PAID)).toBe(true)
    expect(validateOrderTransition(OrderStatus.PAID, OrderStatus.PROCESSING)).toBe(true)
    expect(validateOrderTransition(OrderStatus.PROCESSING, OrderStatus.SHIPPED)).toBe(true)
    expect(validateOrderTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).toBe(true)
    expect(validateOrderTransition(OrderStatus.DELIVERED, OrderStatus.REFUNDED)).toBe(true)

    // Cancellations
    expect(validateOrderTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true)
    expect(validateOrderTransition(OrderStatus.PAID, OrderStatus.CANCELLED)).toBe(true)
    expect(validateOrderTransition(OrderStatus.PROCESSING, OrderStatus.CANCELLED)).toBe(true)

    // Refunds
    expect(validateOrderTransition(OrderStatus.PAID, OrderStatus.REFUNDED)).toBe(true)
    expect(validateOrderTransition(OrderStatus.PROCESSING, OrderStatus.REFUNDED)).toBe(true)
    expect(validateOrderTransition(OrderStatus.SHIPPED, OrderStatus.REFUNDED)).toBe(true)
  })

  it("permits self-transitions (no-op)", () => {
    expect(validateOrderTransition(OrderStatus.PENDING, OrderStatus.PENDING)).toBe(true)
    expect(validateOrderTransition(OrderStatus.DELIVERED, OrderStatus.DELIVERED)).toBe(true)
  })

  it("blocks illegal transitions", () => {
    // Skipping mandatory progression steps
    expect(() => validateOrderTransition(OrderStatus.PENDING, OrderStatus.SHIPPED)).toThrow()
    expect(() => validateOrderTransition(OrderStatus.PENDING, OrderStatus.DELIVERED)).toThrow()

    // Backward transitions
    expect(() => validateOrderTransition(OrderStatus.SHIPPED, OrderStatus.PROCESSING)).toThrow()
    expect(() => validateOrderTransition(OrderStatus.DELIVERED, OrderStatus.PAID)).toThrow()

    // Modifying final terminal states
    expect(() => validateOrderTransition(OrderStatus.CANCELLED, OrderStatus.PENDING)).toThrow()
    expect(() => validateOrderTransition(OrderStatus.REFUNDED, OrderStatus.PAID)).toThrow()
  })
})
