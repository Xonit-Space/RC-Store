import { z } from "zod"

export const PosOrderItemSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative"),
})

export const PosOrderCreateSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(PosOrderItemSchema).min(1, "At least one item is required for checkout"),
  payment: z.object({
    paymentType: z.enum(["CASH", "CARD", "CREDIT"]),
    amount: z.number().nonnegative("Amount must be non-negative"),
    cashReceived: z.number().nonnegative().optional(),
    changeToGive: z.number().nonnegative().optional(),
  }),
  note: z.string().max(500).optional(),
  idempotencyKey: z.string().min(1, "Idempotency key is required"),
})

export const PosCustomerCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
})

export const CourierCreateSchema = z.object({
  name: z.string().min(1, "Courier name is required").max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
})
