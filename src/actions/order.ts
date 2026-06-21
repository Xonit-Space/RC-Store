"use server"

import { db } from "@/lib/db"
import { getCart } from "./cart"
import { createCheckoutSession, CheckoutItem } from "@/services/stripe"
import { ActionResponse } from "./auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function checkCoupon(code: string, subtotal: number): Promise<ActionResponse> {
  try {
    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon || !coupon.isActive) {
      return { success: false, error: "Invalid coupon code" }
    }

    const now = new Date()
    if (now < coupon.startDate || now > coupon.endDate) {
      return { success: false, error: "This coupon code has expired" }
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, error: "This coupon code usage limit has been reached" }
    }

    if (subtotal < coupon.minOrderAmount) {
      return {
        success: false,
        error: `Minimum order amount of $${coupon.minOrderAmount} is required for this coupon`,
      }
    }

    let discount = 0
    if (coupon.discountType === "PERCENTAGE") {
      discount = (subtotal * coupon.discountValue) / 100
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount)
      }
    } else {
      discount = coupon.discountValue
    }

    return {
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        discount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    }
  } catch (error) {
    return { success: false, error: "Failed to validate coupon" }
  }
}

export async function processStripeCheckout(
  userId: string,
  email: string,
  successUrl: string,
  cancelUrl: string,
  couponCode?: string,
  shippingCost = 0
): Promise<ActionResponse> {
  try {
    // 1. Fetch User Cart
    const cart = await getCart(userId)
    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Your shopping cart is empty" }
    }

    // 2. Map Items for Stripe Processing
    const checkoutItems: CheckoutItem[] = cart.items.map((item) => {
      const price = item.variant.price || item.variant.product.price
      return {
        name: `${item.variant.product.name} (${item.variant.size} - ${item.variant.colorName || item.variant.color})`,
        images: item.variant.product.images
          ? JSON.parse(JSON.stringify(item.variant.product.images)).map((img: any) => img.url)
          : [],
        price,
        quantity: item.quantity,
        variantId: item.variantId,
      }
    })

    // 3. Invoke payment service
    const session = await createCheckoutSession({
      userId,
      email,
      items: checkoutItems,
      successUrl,
      cancelUrl,
      couponCode,
      shippingCost,
    })

    return {
      success: true,
      data: {
        sessionId: session.id,
        checkoutUrl: session.url,
        orderNumber: session.orderNumber,
      },
    }
  } catch (error: any) {
    console.error("Stripe Checkout Action Error:", error)
    return { success: false, error: error.message || "Failed to initialize secure checkout" }
  }
}

import { updateOrderStatus } from "@/repositories/order"
import { OrderStatus } from "@prisma/client"

export async function adminUpdateOrderStatus(
  adminId: string,
  orderId: string,
  status: OrderStatus
): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized access" }
  }

  try {
    const updated = await updateOrderStatus(orderId, status)
    
    // Write admin audit trail
    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "ORDER_STATUS_UPDATE",
        entity: "Order",
        entityId: orderId,
        changes: JSON.stringify({ status })
      }
    }).catch(() => {})

    return { success: true, data: updated }
  } catch (err: any) {
    console.error("CMS Order Status Update Error:", err)
    return { success: false, error: err.message || "Failed to update order status" }
  }
}
