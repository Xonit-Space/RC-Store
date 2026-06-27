"use server"

import { db } from "@/lib/db"
import { ActionResponse } from "./auth"
import { sendEmail, sendAbandonedCartRecovery } from "@/services/email"

import { validateAndCalculateCoupon } from "@/lib/coupon"

export async function applyCampaignCoupon(code: string, subtotal: number): Promise<ActionResponse> {
  try {
    const result = await validateAndCalculateCoupon(code, subtotal)
    return result
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
        items: {
          include: { 
            variant: { include: { product: { include: { images: { take: 1 } } } } },
            addon: true
          }
        }
      },
    })

    let emailsFired = 0

    // 2. Iterate and fire recovery campaigns
    for (const cart of cartsToRecover) {
      if (!cart.user || !cart.user.email || !cart.userId) continue

      const userEmail = cart.user.email
      const userName = cart.user.name || "Customer"
      const userId = cart.userId

      await db.$transaction(async (tx) => {
        // Flag basket as recovered
        await tx.abandonedCart.create({
          data: {
            cartId: cart.id,
            userId: userId,
            lastActive: cart.updatedAt,
            emailSent: true,
          },
        })

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
        
        // Fire Resend campaign
        await sendAbandonedCartRecovery({
          email: userEmail,
          customerName: userName,
          items: cart.items.map(item => ({
            id: item.id,
            name: item.variant?.product?.name || item.addon?.name || "Product",
            price: Number(item.variant?.price || item.variant?.product?.price || item.addon?.price || 0),
            image: item.variant?.product?.images?.[0]?.url || item.addon?.image || undefined
          })),
          checkoutUrl: `${baseUrl}/cart`
        })
      })

      emailsFired++
    }

    return { success: true, data: { recoveredBaskets: cartsToRecover.length, emailsFired } }
  } catch (error) {
    console.error("Cart Recovery Cron Job Failed:", error)
    return { success: false, error: "Failed to execute recovery routine" }
  }
}
