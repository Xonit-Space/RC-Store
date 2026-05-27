import { OrderStatus } from "@prisma/client"

/**
 * Strict Order State Transition Mapping (Enterprise State Machine)
 * Guarantees that order lifecycles strictly transition through correct states,
 * preventing illegal updates like PENDING -> SHIPPED or modifying CANCELLED orders.
 */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [
    OrderStatus.PAID, 
    OrderStatus.CANCELLED
  ],
  [OrderStatus.PAID]: [
    OrderStatus.PROCESSING, 
    OrderStatus.CANCELLED, 
    OrderStatus.REFUNDED
  ],
  [OrderStatus.PROCESSING]: [
    OrderStatus.SHIPPED, 
    OrderStatus.CANCELLED, 
    OrderStatus.REFUNDED
  ],
  [OrderStatus.SHIPPED]: [
    OrderStatus.DELIVERED, 
    OrderStatus.CANCELLED, 
    OrderStatus.REFUNDED
  ],
  [OrderStatus.DELIVERED]: [
    OrderStatus.REFUNDED
  ],
  [OrderStatus.CANCELLED]: [], // Terminal state
  [OrderStatus.REFUNDED]: [],  // Terminal state
}

/**
 * Validates whether a transition from one OrderStatus to another is legally allowed.
 * Returns true if valid, or throws an Error if invalid.
 */
export function validateOrderTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) {
    return true // No-op is always valid
  }

  const allowedTargets = VALID_TRANSITIONS[from]
  if (!allowedTargets || !allowedTargets.includes(to)) {
    throw new Error(`Invalid order status transition: Cannot move from ${from} to ${to}`)
  }

  return true
}
