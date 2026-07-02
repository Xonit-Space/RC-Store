import { Job } from "bullmq"
import { createWorker } from "../worker"
import { sendEmailJob } from "@/services/email-job"
import { db } from "@/lib/db"
import { sendAbandonedCartRecovery } from "@/services/email"
import { logger } from "@/lib/logger"

const ONE_HOUR_MS = 60 * 60 * 1000

/**
 * Scans for carts that have been idle for more than 1 hour and
 * dispatches abandoned cart recovery emails to those users.
 */
async function processAbandonedCarts(): Promise<void> {
  const cutoff = new Date(Date.now() - ONE_HOUR_MS)

  // Find users with non-empty carts, last updated >1hr ago, who haven't ordered recently
  const staleCarts = await db.cart.findMany({
    where: {
      updatedAt: { lt: cutoff },
      items: { some: {} }, // cart must have at least one item
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      items: {
        take: 4, // only need enough for the email preview
        include: {
          variant: { include: { product: { select: { name: true, price: true, images: true } } } },
          addon: { select: { id: true, name: true, price: true, image: true } },
        },
      },
    },
    take: 50, // safety cap — process max 50 per sweep
  })

  logger.info(`[AbandonedCart] Found ${staleCarts.length} stale carts to process`)

  for (const cart of staleCarts) {
    const { user, items } = cart
    if (!user?.email) continue

    // Skip if user has placed an order in the last 24h (they likely already converted)
    const recentOrder = await db.order.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 24 * ONE_HOUR_MS) },
      },
      select: { id: true },
    })
    if (recentOrder) continue

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

    const emailItems = items.map((item) => ({
      id: item.id,
      name: item.variant?.product.name ?? item.addon?.name ?? "Product",
      image:
        item.variant?.product.images
          ? (() => {
              try {
                const imgs = JSON.parse(JSON.stringify(item.variant!.product.images)) as any[]
                return imgs[0]?.url ?? undefined
              } catch {
                return undefined
              }
            })()
          : item.addon?.image ?? undefined,
      price: Number(item.variant?.product.price ?? item.addon?.price ?? 0),
    }))

    await sendAbandonedCartRecovery({
      email: user.email,
      customerName: user.name ?? "Customer",
      items: emailItems,
      checkoutUrl: `${baseUrl}/cart`,
    }).catch((err) =>
      logger.error({ message: `[AbandonedCart] Email failed for user ${user.id}`, error: err })
    )
  }
}

export const emailWorker = createWorker("email", async (job: Job) => {
  if (job.name === "abandoned_cart_sweep") {
    return processAbandonedCarts()
  }
  // Standard queued email delivery
  return sendEmailJob(job.data)
})
