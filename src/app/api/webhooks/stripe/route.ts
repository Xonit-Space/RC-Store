import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/services/stripe"
import { db } from "@/lib/db"
import { sendOrderConfirmationSms } from "@/services/twilio"
import { sendOrderConfirmation } from "@/services/email"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    logger.warn({ message: `Stripe webhook signature verification failed: ${error.message}` })
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    // FIX API-003: Idempotency guard — Stripe guarantees at-least-once delivery
    // Check if we already successfully processed this exact event ID
    const existingEvent = await db.webhookEvent.findUnique({
      where: { stripeEventId: event.id },
      select: { status: true },
    })
    if (existingEvent?.status === "PROCESSED") {
      logger.info({ message: `Duplicate Stripe webhook event ignored: ${event.id}` })
      return new NextResponse(null, { status: 200 }) // Idempotent replay — already handled
    }

    // Record this event as IN_PROGRESS before processing
    await db.webhookEvent.upsert({
      where: { stripeEventId: event.id },
      create: {
        stripeEventId: event.id,
        stripeCreated: event.created,
        eventType: event.type,
        payload: JSON.stringify(event),
        status: "PENDING",
      },
      update: { status: "PENDING" },
    })

    const session = event.data.object as any
    const { userId, orderNumber, variantMapping } = session.metadata ?? {}
    const items: { variantId?: string; addonId?: string; quantity: number }[] = JSON.parse(variantMapping || "[]")

    if (!userId || !orderNumber) {
      logger.error({ message: `Stripe webhook missing metadata for event ${event.id}`, context: { eventId: event.id } })
      // Return 400 so Stripe retries (this should never happen in practice)
      return new NextResponse("Missing metadata", { status: 400 })
    }

    // FIX API-001: Fetch user's default shipping address from DB instead of hardcoding "default"
    const userWithAddress = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        addresses: {
          where: { isDefaultShipping: true },
          take: 1,
          select: { id: true, phone: true },
        },
      },
    })

    const defaultAddressId = userWithAddress?.addresses[0]?.id ?? undefined

    // FIX API-002: Fetch actual variant and addon prices from DB for accurate order line-item recording
    const variantIds = items.filter((i) => i.variantId).map((i) => i.variantId as string)
    const addonIds = items.filter((i) => i.addonId).map((i) => i.addonId as string)
    
    const [variants, addons] = await Promise.all([
      variantIds.length > 0 ? db.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: { select: { price: true } } },
      }) : [],
      addonIds.length > 0 ? db.addon.findMany({
        where: { id: { in: addonIds } },
        select: { id: true, price: true },
      }) : []
    ])

    const variantPriceMap = new Map(
      variants.map((v) => [v.id, Number(v.price ?? v.product.price)])
    )
    const addonPriceMap = new Map(
      addons.map((a) => [a.id, Number(a.price)])
    )

    // FIX ERR-001: Wrap the entire fulfillment in a transaction so no partial state can occur
    // (previously, order creation failure was silently swallowed by .catch() while cart deletion proceeded)
    try {
      await db.$transaction(async (tx) => {
        let addressId = defaultAddressId

        // If user has no default address, create one from Stripe shipping details
        if (!addressId) {
          const sd = session.shipping_details?.address || session.customer_details?.address
          const createdAddress = await tx.address.create({
            data: {
              userId,
              title: "Stripe Checkout Address",
              line1: sd?.line1 || "N/A",
              line2: sd?.line2 || null,
              city: sd?.city || "N/A",
              state: sd?.state || "N/A",
              postalCode: sd?.postal_code || "N/A",
              country: sd?.country || "US",
              phone: session.customer_details?.phone || "N/A",
              isDefaultShipping: true,
              isDefaultBilling: true,
            }
          })
          addressId = createdAddress.id
        }

        // 1. Create Order with real address IDs and real prices
        await tx.order.create({
          data: {
            orderNumber,
            userId,
            status: "PAID",
            subtotal: session.amount_subtotal / 100,
            tax: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
            shippingCost: session.total_details?.amount_shipping ? session.total_details.amount_shipping / 100 : 0,
            discount: session.total_details?.amount_discount ? session.total_details.amount_discount / 100 : 0,
            total: session.amount_total / 100,
            // FIX API-001: Use the real DB address ID
            shippingAddressId: addressId,
            billingAddressId: addressId,
            items: {
              create: items.map((item) => {
                // FIX API-002: Use the actual price fetched from DB
                const unitPrice = item.variantId 
                  ? (variantPriceMap.get(item.variantId) ?? 0)
                  : (item.addonId ? (addonPriceMap.get(item.addonId) ?? 0) : 0)
                  
                return {
                  variantId: item.variantId || null,
                  addonId: item.addonId || null,
                  quantity: item.quantity,
                  price: unitPrice,
                  total: unitPrice * item.quantity,
                }
              }),
            },
            payment: {
              create: {
                gateway: "STRIPE",
                transactionId: session.payment_intent as string,
                amount: session.amount_total / 100,
                status: "COMPLETED",
              },
            },
          },
        })

        // 2. Clear the user cart atomically within the same transaction
        await tx.cart.deleteMany({ where: { userId } })
      })

      // Mark webhook event as fully processed — prevents future duplicate processing
      await db.webhookEvent.update({
        where: { stripeEventId: event.id },
        data: { status: "PROCESSED", processedAt: new Date() },
      }).catch((e) => logger.warn({ message: "Failed to mark webhook event PROCESSED", error: e }))

      logger.info({
        message: `Order ${orderNumber} created successfully from Stripe webhook`,
        context: { orderNumber, userId, eventId: event.id },
      })
    } catch (err: any) {
      logger.error({
        message: `CRITICAL: Order creation failed in Stripe webhook for ${orderNumber}`,
        error: err,
        context: { orderNumber, userId, eventId: event.id },
      })
      // Return 500 so Stripe retries the webhook — the order was NOT created
      return new NextResponse("Order creation failed", { status: 500 })
    }

    // 3. Send SMS Confirmation (outside transaction — side effects after commit)
    const phone = userWithAddress?.addresses[0]?.phone || session.customer_details?.phone || null
    if (phone) {
      await sendOrderConfirmationSms(phone, orderNumber, session.amount_total / 100)
        .catch((err) => logger.warn({ message: "SMS confirmation failed (non-critical)", error: err }))
    }

    // 4. Send HTML Email Confirmation
    const email = session.customer_details?.email || userWithAddress?.addresses[0]?.phone ? "" : "customer@example.com" // Needs actual email, let's pull from user
    const userEmail = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } })
    const targetEmail = session.customer_details?.email || userEmail?.email

    if (targetEmail) {
      // Map items for the email template
      const emailItems = items.map((item) => {
        const variant = variants.find(v => v.id === item.variantId)
        const addon = addons.find(a => a.id === item.addonId)
        return {
          id: item.variantId || item.addonId || Math.random().toString(),
          name: variant?.product.name || addon?.name || "Product",
          quantity: item.quantity,
          price: variantPriceMap.get(item.variantId!) ?? addonPriceMap.get(item.addonId!) ?? 0,
        }
      })

      const sd = session.shipping_details?.address || session.customer_details?.address
      const addressString = sd ? `${sd.line1}, ${sd.city}, ${sd.state} ${sd.postal_code}, ${sd.country}` : "Address provided at checkout"

      await sendOrderConfirmation({
        email: targetEmail,
        orderNumber,
        customerName: session.customer_details?.name || userEmail?.name || "Customer",
        items: emailItems,
        subtotal: session.amount_subtotal / 100,
        tax: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
        shipping: session.total_details?.amount_shipping ? session.total_details.amount_shipping / 100 : 0,
        total: session.amount_total / 100,
        shippingAddress: addressString,
      }).catch((err) => logger.warn({ message: "Email confirmation failed (non-critical)", error: err }))
    }
  }

  return new NextResponse(null, { status: 200 })
}
