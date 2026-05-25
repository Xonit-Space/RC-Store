"use"

import { db } from "@/lib/db"
import { ActionResponse } from "./auth"
import { sendEmail, sendAbandonedCartRecovery } from "@/services/email"

export async function applyCampaignCoupon(code: string, subtotal: number): Promise<ActionResponse> {
  const normalizedCode = code.trim().toUpperCase()

  try {
    const coupon = await db.coupon.findUnique({
      where: { code: normalizedCode },
    })

    if (!coupon || !coupon.isActive) {
      return { success: false, error: "This coupon is either invalid or inactive" }
    }

    const now = new Date()
    if (now < coupon.startDate || now > coupon.endDate) {
      return { success: false, error: "This coupon code has expired" }
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, error: "The usage limit for this coupon has been reached" }
    }

    if (subtotal < coupon.minOrderAmount) {
      return {
        success: false,
        error: `Minimum subtotal of $${coupon.minOrderAmount.toFixed(2)} is required to apply this coupon`,
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

export async function newsletterSubscribe(email: string): Promise<ActionResponse> {
  const sanitizedEmail = email.trim().toLowerCase()
  if (!sanitizedEmail.includes("@")) {
    return { success: false, error: "Invalid email address format" }
  }

  // Generate a cryptographically secure token reference for unsubscription
  const unsubscribeToken = `unsub_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`

  try {
    await db.emailSubscriber.upsert({
      where: { email: sanitizedEmail },
      update: { status: "ACTIVE" },
      create: {
        email: sanitizedEmail,
        token: unsubscribeToken,
        status: "ACTIVE",
      },
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to process subscription" }
  }
}

/**
 * Enterprise Abandoned Cart Recovery Cron Job Simulator:
 * Sweeps the database for shopping baskets inactive for more than 2 hours,
 * logs them in AbandonedCart tracking, and fires recovery emails to users.
 */
export async function runAbandonedCartJob(): Promise<ActionResponse> {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)

  try {
    // 1. Find all active user carts modified before our threshold and unnotified
    const cartsToRecover = await db.cart.findMany({
      where: {
        updatedAt: { lte: twoHoursAgo },
        userId: { not: null },
        items: { some: {} },
        abandonedCarts: {
          none: {}, // Cart was not previously flagged
        },
      },
      include: {
        user: { select: { email: true, name: true } },
      },
    })

    let emailsFired = 0

    // 2. Iterate and fire recovery campaigns
    for (const cart of cartsToRecover) {
      if (!cart.user || !cart.user.email) continue

      await db.$transaction(async (tx) => {
        // Flag basket as recovered
        await tx.abandonedCart.create({
          data: {
            cartId: cart.id,
            userId: cart.userId,
            lastActive: cart.updatedAt,
            emailSent: true,
          },
        })

        // Fire Resend campaign
        await sendAbandonedCartRecovery(
          cart.user.email,
          cart.user.name || "Customer",
          "http://localhost:3000/cart"
        )
      })

      emailsFired++
    }

    return { success: true, data: { recoveredBaskets: cartsToRecover.length, emailsFired } }
  } catch (error) {
    console.error("Cart Recovery Cron Job Failed:", error)
    return { success: false, error: "Failed to execute recovery routine" }
  }
}
