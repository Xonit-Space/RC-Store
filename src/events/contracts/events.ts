import { z } from "zod"

// ----------------------------------------------------
// 1. Generic Event Envelope
// ----------------------------------------------------
export const DomainEventEnvelopeSchema = z.object({
  eventId: z.string(),
  eventType: z.string(),
  timestamp: z.date(),
  payload: z.any(),
  signature: z.string().optional(),
})

export type DomainEventEnvelope<T = any> = z.infer<typeof DomainEventEnvelopeSchema> & {
  payload: T
}

// ----------------------------------------------------
// 2. Specific Event Payload Schemas & Interfaces
// ----------------------------------------------------

// 1. ORDER_CREATED
export const OrderCreatedSchema = z.object({
  orderId: z.string(),
  userId: z.string(),
  total: z.number().positive(),
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().nonnegative(),
    })
  ),
})
export type OrderCreatedPayload = z.infer<typeof OrderCreatedSchema>

// 2. PAYMENT_COMPLETED
export const PaymentCompletedSchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  amount: z.number().positive(),
  gateway: z.string().default("STRIPE"),
})
export type PaymentCompletedPayload = z.infer<typeof PaymentCompletedSchema>

// 3. INVENTORY_RESERVED
export const InventoryReservedSchema = z.object({
  reservationId: z.string(),
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  expiresAt: z.string(), // ISO String
})
export type InventoryReservedPayload = z.infer<typeof InventoryReservedSchema>

// 4. INVENTORY_RELEASED
export const InventoryReleasedSchema = z.object({
  reservationId: z.string(),
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  reason: z.string(),
})
export type InventoryReleasedPayload = z.infer<typeof InventoryReleasedSchema>

// 5. PRODUCT_VIEWED
export const ProductViewedSchema = z.object({
  userId: z.string().optional(),
  productId: z.string(),
  anonymousId: z.string().optional(),
})
export type ProductViewedPayload = z.infer<typeof ProductViewedSchema>

// 6. CART_UPDATED
export const CartUpdatedSchema = z.object({
  cartId: z.string(),
  userId: z.string().optional(),
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().int().nonnegative(),
    })
  ),
})
export type CartUpdatedPayload = z.infer<typeof CartUpdatedSchema>

// 7. USER_REGISTERED
export const UserRegisteredSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
})
export type UserRegisteredPayload = z.infer<typeof UserRegisteredSchema>

// 8. REVIEW_CREATED
export const ReviewCreatedSchema = z.object({
  reviewId: z.string(),
  productId: z.string(),
  userId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})
export type ReviewCreatedPayload = z.infer<typeof ReviewCreatedSchema>

// 9. REFUND_ISSUED
export const RefundIssuedSchema = z.object({
  refundId: z.string(),
  orderId: z.string(),
  amount: z.number().positive(),
  reason: z.string(),
})
export type RefundIssuedPayload = z.infer<typeof RefundIssuedSchema>

// 10. SHIPMENT_UPDATED
export const ShipmentUpdatedSchema = z.object({
  shipmentId: z.string(),
  orderId: z.string(),
  status: z.string(), // e.g. "LABEL_CREATED", "IN_TRANSIT", "DELIVERED"
  trackingNumber: z.string(),
  carrier: z.string(),
})
export type ShipmentUpdatedPayload = z.infer<typeof ShipmentUpdatedSchema>

// ----------------------------------------------------
// 3. Schema Registry Mapping
// ----------------------------------------------------
export const EventSchemaRegistry = {
  ORDER_CREATED: OrderCreatedSchema,
  PAYMENT_COMPLETED: PaymentCompletedSchema,
  INVENTORY_RESERVED: InventoryReservedSchema,
  INVENTORY_RELEASED: InventoryReleasedSchema,
  PRODUCT_VIEWED: ProductViewedSchema,
  CART_UPDATED: CartUpdatedSchema,
  USER_REGISTERED: UserRegisteredSchema,
  REVIEW_CREATED: ReviewCreatedSchema,
  REFUND_ISSUED: RefundIssuedSchema,
  SHIPMENT_UPDATED: ShipmentUpdatedSchema,
} as const

export type EventType = keyof typeof EventSchemaRegistry
