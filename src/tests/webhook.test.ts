/**
 * Tests for Stripe webhook handler fixes:
 * API-001: Hardcoded address IDs replaced with real DB lookup
 * API-002: Order items price=0 replaced with real DB variant prices
 * API-003: Idempotency guard prevents duplicate orders on Stripe retry
 * ERR-001: Order creation failure now returns 500 so Stripe retries
 */
import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock DB
const mockDb = {
  webhookEvent: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
  productVariant: {
    findMany: vi.fn(),
  },
  order: {
    create: vi.fn(),
  },
  address: {
    create: vi.fn(),
  },
  cart: {
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(),
}

// Mock Stripe
const mockStripe = {
  webhooks: {
    constructEvent: vi.fn(),
  },
}

// Mock SMS
const mockSendSms = vi.fn()

vi.mock("@/lib/db", () => ({ db: mockDb }))
vi.mock("@/services/stripe", () => ({ stripe: mockStripe }))
vi.mock("@/services/twilio", () => ({ sendOrderConfirmationSms: mockSendSms }))
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
vi.mock("next/headers", () => ({
  headers: () => ({ get: () => "stripe-signature-test" }),
}))

// Helper: build a minimal Stripe checkout.session.completed event
function buildStripeEvent(overrides: Record<string, any> = {}) {
  return {
    id: "evt_test_001",
    type: "checkout.session.completed",
    created: 1700000000,
    data: {
      object: {
        amount_subtotal: 5000, // $50
        amount_total: 5500,    // $55 (after tax)
        payment_intent: "pi_test_001",
        customer_details: { phone: "+15551234567" },
        total_details: { amount_tax: 500, amount_shipping: 0, amount_discount: 0 },
        metadata: {
          userId: "user_abc",
          orderNumber: "NS-001-TEST",
          variantMapping: JSON.stringify([{ variantId: "var_001", quantity: 2 }]),
        },
        ...overrides,
      },
    },
  }
}

describe("Stripe Webhook Handler — API-001, API-002, API-003, ERR-001", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: no existing webhook event (not previously processed)
    mockDb.webhookEvent.findUnique.mockResolvedValue(null)
    mockDb.webhookEvent.upsert.mockResolvedValue({})
    mockDb.webhookEvent.update.mockResolvedValue({})

    // Default user with a real default address
    mockDb.user.findUnique.mockResolvedValue({
      id: "user_abc",
      addresses: [{ id: "addr_real_001", phone: "+15559876543" }],
    })

    // Default variant with real price
    mockDb.productVariant.findMany.mockResolvedValue([
      {
        id: "var_001",
        price: 25.00,
        product: { price: 20.00 }, // variant price takes precedence
      },
    ])

    // Default transaction — runs the callback
    mockDb.$transaction.mockImplementation(async (fn: (tx: any) => Promise<void>) => {
      await fn({
        order: { create: mockDb.order.create },
        address: { create: mockDb.address.create },
        cart: { deleteMany: mockDb.cart.deleteMany },
      })
    })

    mockDb.address.create.mockResolvedValue({ id: "addr_created_001" })
    mockDb.order.create.mockResolvedValue({ id: "order_001" })
    mockDb.cart.deleteMany.mockResolvedValue({ count: 1 })
    mockSendSms.mockResolvedValue(true)
  })

  // ─── API-003: Idempotency ───────────────────────────────────────────────

  describe("API-003: Webhook Idempotency", () => {
    it("should return 200 immediately for duplicate PROCESSED events without creating an order", async () => {
      // Simulate a previously-processed event
      mockDb.webhookEvent.findUnique.mockResolvedValue({ status: "PROCESSED" })
      mockStripe.webhooks.constructEvent.mockReturnValue(buildStripeEvent())

      const { POST } = await import("@/app/api/webhooks/stripe/route")
      const req = new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
      const response = await POST(req)

      // Should return 200 without doing any order creation
      expect(response.status).toBe(200)
      expect(mockDb.$transaction).not.toHaveBeenCalled()
      expect(mockDb.order.create).not.toHaveBeenCalled()
    })

    it("should process new events (not previously seen)", async () => {
      mockDb.webhookEvent.findUnique.mockResolvedValue(null) // Never seen before
      mockStripe.webhooks.constructEvent.mockReturnValue(buildStripeEvent())

      const { POST } = await import("@/app/api/webhooks/stripe/route")
      const req = new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
      await POST(req)

      // Should have created an order
      expect(mockDb.$transaction).toHaveBeenCalledOnce()
    })

    it("should mark the event as PROCESSED after successful order creation", async () => {
      mockDb.webhookEvent.findUnique.mockResolvedValue(null)
      mockStripe.webhooks.constructEvent.mockReturnValue(buildStripeEvent())

      const { POST } = await import("@/app/api/webhooks/stripe/route")
      const req = new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
      await POST(req)

      expect(mockDb.webhookEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "PROCESSED" }),
        })
      )
    })
  })

  // ─── API-001: Address IDs ───────────────────────────────────────────────

  describe("API-001: Real Address IDs", () => {
    it("should use the real DB address ID, not hardcoded string", async () => {
      mockDb.webhookEvent.findUnique.mockResolvedValue(null)
      mockStripe.webhooks.constructEvent.mockReturnValue(buildStripeEvent())

      const { POST } = await import("@/app/api/webhooks/stripe/route")
      const req = new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
      await POST(req)

      const createCall = mockDb.order.create.mock.calls[0][0]
      expect(createCall.data.shippingAddressId).toBe("addr_real_001")
      expect(createCall.data.billingAddressId).toBe("addr_real_001")
      // Must NOT be the old hardcoded placeholder
      expect(createCall.data.shippingAddressId).not.toBe("default")
    })

    it("should create an address when user has no default address", async () => {
      mockDb.webhookEvent.findUnique.mockResolvedValue(null)
      mockStripe.webhooks.constructEvent.mockReturnValue(buildStripeEvent())
      // User has no default address
      mockDb.user.findUnique.mockResolvedValue({ id: "user_abc", addresses: [] })

      const { POST } = await import("@/app/api/webhooks/stripe/route")
      const req = new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
      await POST(req)

      expect(mockDb.address.create).toHaveBeenCalledOnce()
      const createAddressCall = mockDb.address.create.mock.calls[0][0]
      expect(createAddressCall.data.userId).toBe("user_abc")

      const createOrderCall = mockDb.order.create.mock.calls[0][0]
      expect(createOrderCall.data.shippingAddressId).toBe("addr_created_001")
    })
  })

  // ─── API-002: Real Prices ───────────────────────────────────────────────

  describe("API-002: Real Order Item Prices", () => {
    it("should set price and total from DB variant price, not zero", async () => {
      mockDb.webhookEvent.findUnique.mockResolvedValue(null)
      mockStripe.webhooks.constructEvent.mockReturnValue(buildStripeEvent())

      const { POST } = await import("@/app/api/webhooks/stripe/route")
      const req = new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
      await POST(req)

      const createCall = mockDb.order.create.mock.calls[0][0]
      const lineItem = createCall.data.items.create[0]
      // Variant price is $25, quantity is 2
      expect(lineItem.price).toBe(25)
      expect(lineItem.total).toBe(50)
      expect(lineItem.price).not.toBe(0)
      expect(lineItem.total).not.toBe(0)
    })

    it("should fall back to product price when variant has no specific price", async () => {
      mockDb.webhookEvent.findUnique.mockResolvedValue(null)
      mockStripe.webhooks.constructEvent.mockReturnValue(buildStripeEvent())
      // Variant has null price — should fall back to product price
      mockDb.productVariant.findMany.mockResolvedValue([
        { id: "var_001", price: null, product: { price: 20.00 } },
      ])

      const { POST } = await import("@/app/api/webhooks/stripe/route")
      const req = new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
      await POST(req)

      const createCall = mockDb.order.create.mock.calls[0][0]
      const lineItem = createCall.data.items.create[0]
      expect(lineItem.price).toBe(20) // product price fallback
      expect(lineItem.total).toBe(40) // 20 * 2
    })
  })

  // ─── ERR-001: Error Propagation ─────────────────────────────────────────

  describe("ERR-001: Order Creation Error Returns 500 (not 200)", () => {
    it("should return 500 when transaction fails so Stripe retries", async () => {
      mockDb.webhookEvent.findUnique.mockResolvedValue(null)
      mockStripe.webhooks.constructEvent.mockReturnValue(buildStripeEvent())
      // Simulate a DB transaction failure
      mockDb.$transaction.mockRejectedValue(new Error("DB constraint violation"))

      const { POST } = await import("@/app/api/webhooks/stripe/route")
      const req = new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
      const response = await POST(req)

      expect(response.status).toBe(500)
    })

    it("should NOT clear the cart when order creation fails", async () => {
      mockDb.webhookEvent.findUnique.mockResolvedValue(null)
      mockStripe.webhooks.constructEvent.mockReturnValue(buildStripeEvent())
      mockDb.$transaction.mockRejectedValue(new Error("DB failure"))

      const { POST } = await import("@/app/api/webhooks/stripe/route")
      const req = new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
      await POST(req)

      // Cart should NOT be deleted since transaction rolled back
      expect(mockDb.cart.deleteMany).not.toHaveBeenCalled()
    })
  })

  // ─── Signature Verification ─────────────────────────────────────────────

  describe("Webhook Signature Verification", () => {
    it("should return 400 when Stripe signature is invalid", async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error("No signatures found matching the expected signature for payload")
      })

      const { POST } = await import("@/app/api/webhooks/stripe/route")
      const req = new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "tampered-body",
      })
      const response = await POST(req)

      expect(response.status).toBe(400)
      expect(mockDb.order.create).not.toHaveBeenCalled()
    })
  })
})
