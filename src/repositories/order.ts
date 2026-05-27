import { db } from "@/lib/db"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { validateOrderTransition } from "@/lib/security/state-machine"

export interface OrderItemInput {
  variantId: string
  quantity: number
  price: number // snapshot price
}

export interface CreateOrderInput {
  orderNumber: string
  userId: string
  items: OrderItemInput[]
  shippingAddressId: string
  billingAddressId: string
  subtotal: number
  tax: number
  shippingCost: number
  discount: number
  total: number
  couponId?: string
}

export async function createOrder(input: CreateOrderInput) {
  return db.$transaction(async (tx) => {
    // 1. Verify and lock inventory stock first using raw pessimistic row locks
    for (const item of input.items) {
      const inventories = await tx.$queryRaw<any[]>`
        SELECT id, quantity, reserved FROM inventory
        WHERE "variantId" = ${item.variantId}
        FOR UPDATE
      `
      const inventory = inventories[0]

      if (!inventory) {
        throw new Error(`Inventory records not found for SKU variant: ${item.variantId}`)
      }

      const available = inventory.quantity - inventory.reserved
      if (available < item.quantity) {
        throw new Error(`Insufficient stock for item variant: ${item.variantId}. Available: ${available}, Requested: ${item.quantity}`)
      }

      // Decrement stock and update inventory (releasing the reservation lock)
      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: { decrement: item.quantity },
          reserved: { decrement: Math.min(inventory.reserved, item.quantity) },
        },
      })

      // Write inventory movement log
      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          quantity: -item.quantity,
          type: "SHIPMENT",
          reason: `Stripe online checkout: ${input.orderNumber}`
        }
      })
    }

    // 2. Increment coupon used count if any
    if (input.couponId) {
      const coupon = await tx.coupon.findUnique({
        where: { id: input.couponId },
      })

      if (coupon) {
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          throw new Error("Coupon limit exceeded")
        }

        await tx.coupon.update({
          where: { id: input.couponId },
          data: {
            usedCount: { increment: 1 },
          },
        })
      }
    }

    // 3. Create the Order
    return tx.order.create({
      data: {
        orderNumber: input.orderNumber,
        userId: input.userId,
        status: OrderStatus.PENDING,
        subtotal: input.subtotal,
        tax: input.tax,
        shippingCost: input.shippingCost,
        discount: input.discount,
        total: input.total,
        shippingAddressId: input.shippingAddressId,
        billingAddressId: input.billingAddressId,
        couponId: input.couponId,
        items: {
          create: input.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    })
  })
}

export async function getOrdersByUserId(userId: string) {
  return db.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { images: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { images: true },
              },
            },
          },
        },
      },
      shippingAddress: true,
      billingAddress: true,
      payment: true,
      shipment: true,
      user: {
        select: { name: true, email: true },
      },
    },
  })
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      select: { status: true },
    })

    if (!order) {
      throw new Error(`Order not found with ID: ${id}`)
    }

    validateOrderTransition(order.status, status)

    return tx.order.update({
      where: { id },
      data: { status },
    })
  })
}

export async function updatePaymentStatus(orderId: string, transactionId: string, status: PaymentStatus, brand?: string, last4?: string) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } })
    if (!order) throw new Error("Order not found")

    // Update order status if payment is completed — enforced through the state machine
    if (status === PaymentStatus.COMPLETED) {
      validateOrderTransition(order.status, OrderStatus.PAID)
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      })
    }

    return tx.payment.upsert({
      where: { orderId },
      update: {
        status,
        transactionId,
        cardBrand: brand,
        cardLast4: last4,
      },
      create: {
        orderId,
        gateway: "STRIPE",
        transactionId,
        amount: order.total,
        status,
        cardBrand: brand,
        cardLast4: last4,
      },
    })
  })
}

/**
 * Enterprise Dashboard Analytics:
 * Aggregates monthly revenues and dynamic order statistics for chart canvases
 */
export async function getOrderStats() {
  const [totalRevenueResult, totalOrders, pendingOrders, completedOrders] = await Promise.all([
    db.payment.aggregate({
      where: { status: PaymentStatus.COMPLETED },
      _sum: { amount: true },
    }),
    db.order.count(),
    db.order.count({ where: { status: OrderStatus.PENDING } }),
    db.order.count({ where: { status: OrderStatus.DELIVERED } }),
  ])

  return {
    totalRevenue: totalRevenueResult._sum.amount || 0,
    totalOrders,
    pendingOrders,
    completedOrders,
  }
}
