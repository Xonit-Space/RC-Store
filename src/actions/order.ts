"use server"

import { db } from "@/lib/db"
import { getCart } from "./cart"
import { createCheckoutSession, CheckoutItem } from "@/services/stripe"
import { ActionResponse } from "./auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendOrderStatusUpdateSms } from "@/services/twilio"
import { sendOrderShippedEmail, sendOrderStatusEmail } from "@/services/email"
import { validateAndCalculateCoupon } from "@/lib/coupon"
import { serializeForClient } from "@/lib/serialize"
import { updateOrderStatus } from "@/repositories/order"
import { OrderStatus } from "@prisma/client"
import { logger } from "@/lib/logger"

export interface ShipmentData {
  carrier: string
  trackingNumber: string
  estimatedDelivery?: string // ISO date string
  trackingUrl?: string
}

// ─── Coupon Validation ────────────────────────────────────────────────────────

export async function checkCoupon(code: string, subtotal: number): Promise<ActionResponse> {
  try {
    const result = await validateAndCalculateCoupon(code, subtotal)
    return result
  } catch (error) {
    return { success: false, error: "Failed to validate coupon" }
  }
}

// ─── Stripe Checkout ──────────────────────────────────────────────────────────

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
      if (item.addon) {
        return {
          name: `${item.addon.name} (Addon)`,
          images: item.addon.image ? [item.addon.image] : [],
          price: item.addon.price,
          quantity: item.quantity,
          variantId: null,
          addonId: item.addon.id,
        }
      }

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

// ─── Admin Order Status Update ────────────────────────────────────────────────

/**
 * Maps which statuses trigger SMS notifications (beyond SHIPPED/DELIVERED)
 */
const SMS_STATUSES = new Set<OrderStatus>(["SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"])

/**
 * Maps which statuses trigger email notifications
 */
const EMAIL_STATUSES = new Set<OrderStatus>(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"])

export async function adminUpdateOrderStatus(
  adminId: string,
  orderId: string,
  status: OrderStatus,
  shipmentData?: ShipmentData
): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized access" }
  }

  try {
    const updated = await updateOrderStatus(orderId, status)

    // ── Upsert Shipment record when SHIPPED with tracking data ───────────────
    if (status === "SHIPPED" && shipmentData?.trackingNumber) {
      await db.shipment.upsert({
        where: { orderId },
        create: {
          orderId,
          carrier: shipmentData.carrier || "Standard Delivery",
          trackingNumber: shipmentData.trackingNumber,
          estimatedDelivery: shipmentData.estimatedDelivery
            ? new Date(shipmentData.estimatedDelivery)
            : undefined,
          status: "IN_TRANSIT",
        },
        update: {
          carrier: shipmentData.carrier || "Standard Delivery",
          trackingNumber: shipmentData.trackingNumber,
          estimatedDelivery: shipmentData.estimatedDelivery
            ? new Date(shipmentData.estimatedDelivery)
            : undefined,
          status: "IN_TRANSIT",
        },
      }).catch((err) =>
        logger.error({ message: `[Shipment] Failed to upsert shipment for order ${orderId}`, error: err })
      )
    }

    // Write admin audit trail
    await db.auditLog
      .create({
        data: {
          userId: adminId,
          action: "ORDER_STATUS_UPDATE",
          entity: "Order",
          entityId: orderId,
          changes: JSON.stringify({ status, trackingNumber: shipmentData?.trackingNumber }),
        },
      })
      .catch(() => {})

    // ── Fetch order + user details for notifications ─────────────────────────
    if (SMS_STATUSES.has(status) || EMAIL_STATUSES.has(status)) {
      const orderDetails = await db.order.findUnique({
        where: { id: orderId },
        include: {
          shippingAddress: true,
          user: { select: { email: true, name: true } },
        },
      })

      if (!orderDetails) {
        logger.warn(`[adminUpdateOrderStatus] Order ${orderId} not found for notifications`)
        return { success: true, data: serializeForClient(updated) }
      }

      const { orderNumber, shippingAddress, user } = orderDetails
      const phone = shippingAddress?.phone
      const email = user?.email
      const customerName = user?.name || "Customer"
      const trackingNumber = shipmentData?.trackingNumber
      const trackingUrl = shipmentData?.trackingUrl

      // ── SMS Notifications ──────────────────────────────────────────────────
      if (SMS_STATUSES.has(status) && phone && phone !== "0000000000") {
        sendOrderStatusUpdateSms(phone, orderNumber, status).catch((err) =>
          logger.error({ message: `[SMS] Failed for order ${orderNumber} status ${status}`, error: err })
        )
      }

      // ── Email Notifications ────────────────────────────────────────────────
      if (EMAIL_STATUSES.has(status) && email) {
        if (status === "SHIPPED") {
          sendOrderShippedEmail({
            email,
            orderNumber,
            customerName,
            trackingNumber,  // forwarded from shipmentData
            trackingUrl,
          }).catch((err) =>
            logger.error({ message: `[Email] Shipped email failed for ${orderNumber}`, error: err })
          )
        } else {
          sendOrderStatusEmail({
            email,
            orderNumber,
            customerName,
            status,
            trackingNumber,
          }).catch((err) =>
            logger.error({ message: `[Email] Status email (${status}) failed for ${orderNumber}`, error: err })
          )
        }
      }
    }

    return { success: true, data: serializeForClient(updated) }
  } catch (err: any) {
    console.error("CMS Order Status Update Error:", err)
    return { success: false, error: err.message || "Failed to update order status" }
  }
}
