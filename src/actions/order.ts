"use server"

import { db } from "@/lib/db"
import { getCart } from "./cart"
import { createCheckoutSession, CheckoutItem } from "@/services/stripe"
import { ActionResponse } from "./auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendOrderStatusUpdateSms } from "@/services/twilio"
import { validateAndCalculateCoupon } from "@/lib/coupon"

export async function checkCoupon(code: string, subtotal: number): Promise<ActionResponse> {
  try {
    const result = await validateAndCalculateCoupon(code, subtotal)
    return result
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
    const checkoutItems: CheckoutItem[] = cart.items.map((item: any) => {
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
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
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

    // Send SMS notification if status is updated to SHIPPED or DELIVERED
    if (status === "SHIPPED" || status === "DELIVERED") {
      const orderDetails = await db.order.findUnique({
        where: { id: orderId },
        include: { shippingAddress: true }
      })
      if (orderDetails?.shippingAddress?.phone && orderDetails.shippingAddress.phone !== "0000000000") {
        sendOrderStatusUpdateSms(orderDetails.shippingAddress.phone, orderDetails.orderNumber, status).catch(console.error)
      }
    }

    return { success: true, data: updated }
  } catch (err: any) {
    console.error("CMS Order Status Update Error:", err)
    return { success: false, error: err.message || "Failed to update order status" }
  }
}
