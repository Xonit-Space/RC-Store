import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/services/stripe"
import { db } from "@/lib/db"
import { createOrder, updatePaymentStatus } from "@/repositories/order"
import { addAddress } from "@/repositories/user"
import { PaymentStatus } from "@prisma/client"
import { withApiHandler } from "@/lib/api-middleware"
import { sendToDLQ } from "@/services/dlq"

export const POST = withApiHandler(async (req: Request) => {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") || ""

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error("Webhook secret not configured")
  }

  let event: any

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  // ===========================================================
  // PHASE 1: WEBHOOK ORDERING GUARANTEE
  // Store event in DB BEFORE processing.
  // Unique constraint on stripeEventId ensures exactly-once.
  // ===========================================================
  let webhookRecord: { id: string } | null = null
  try {
    webhookRecord = await db.webhookEvent.create({
      data: {
        stripeEventId: event.id,
        stripeCreated: event.created,
        eventType: event.type,
        payload: body,
        status: "PENDING",
      },
      select: { id: true },
    })
  } catch (err: any) {
    // P2002 = unique constraint violation = already stored = already processed or in-flight
    if (err.code === "P2002") {
      console.info(`[Webhook] Event ${event.id} already stored (duplicate delivery). Returning 200.`)
      return NextResponse.json({ received: true, status: "already_processed" }, { status: 200 })
    }
    throw err
  }

  const session = event.data.object

  // ===========================================================
  // PHASE 2: PROCESS checkout.session.completed
  // ===========================================================
  if (event.type === "checkout.session.completed") {
    const metadata = session.metadata
    if (!metadata || !metadata.userId || !metadata.orderNumber) {
      await db.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: { status: "FAILED", errorMessage: "Missing session metadata", processedAt: new Date() },
      })
      return NextResponse.json({ error: "Missing session tracking metadata" }, { status: 400 })
    }

    // ORDER-LEVEL idempotency guard (second layer after event-level above)
    const existingOrder = await db.order.findUnique({
      where: { orderNumber: metadata.orderNumber },
      select: { id: true },
    })
    if (existingOrder) {
      console.info(`[Webhook] Order ${metadata.orderNumber} already exists. Idempotent skip.`)
      await db.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: { status: "PROCESSED", processedAt: new Date() },
      })
      return NextResponse.json({ received: true, status: "already_processed" }, { status: 200 })
    }

    try {
      const { userId, orderNumber, variantMapping } = metadata
      const items = JSON.parse(variantMapping)

      const stripeShipping = session.shipping_details

      if (!stripeShipping || !stripeShipping.address) {
        throw new Error("Missing shipping address details in Stripe session")
      }

      // 1. Write shipping address
      const shippingAddress = await addAddress(userId, {
        title: "Shipping Address (Checkout)",
        line1: stripeShipping.address.line1 || "",
        line2: stripeShipping.address.line2 || undefined,
        city: stripeShipping.address.city || "",
        state: stripeShipping.address.state || "",
        postalCode: stripeShipping.address.postal_code || "",
        country: stripeShipping.address.country || "",
        phone: stripeShipping.phone || "0000000000",
        isDefaultShipping: false,
        isDefaultBilling: false,
      })

      // 2. Write billing address
      const billingAddress = await addAddress(userId, {
        title: "Billing Address (Checkout)",
        line1: session.customer_details?.address?.line1 || stripeShipping.address.line1 || "",
        line2: session.customer_details?.address?.line2 || stripeShipping.address.line2 || undefined,
        city: session.customer_details?.address?.city || stripeShipping.address.city || "",
        state: session.customer_details?.address?.state || stripeShipping.address.state || "",
        postalCode: session.customer_details?.address?.postal_code || stripeShipping.address.postal_code || "",
        country: session.customer_details?.address?.country || stripeShipping.address.country || "",
        phone: stripeShipping.phone || "0000000000",
        isDefaultShipping: false,
        isDefaultBilling: false,
      })

      // 3. Reconstruct order items from variant snapshot
      const orderItems = []
      for (const item of items) {
        const variant = await db.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        })
        if (!variant) throw new Error(`Product SKU variant ${item.variantId} not found`)
        orderItems.push({
          variantId: item.variantId,
          quantity: item.quantity,
          price: variant.price || variant.product.price,
        })
      }

      const subtotal = session.amount_subtotal ? session.amount_subtotal / 100 : 0
      const total = session.amount_total ? session.amount_total / 100 : 0
      const shippingCost = session.shipping_cost?.amount_subtotal
        ? session.shipping_cost.amount_subtotal / 100
        : 0
      const discount = session.total_details?.amount_discount
        ? session.total_details.amount_discount / 100
        : 0
      const tax = session.total_details?.amount_tax
        ? session.total_details.amount_tax / 100
        : 0

      // 4. Create order (atomic inventory transaction inside)
      const order = await createOrder({
        orderNumber,
        userId,
        items: orderItems,
        shippingAddressId: shippingAddress.id,
        billingAddressId: billingAddress.id,
        subtotal,
        tax,
        shippingCost,
        discount,
        total,
      })

      // 5. Update payment status through state machine
      await updatePaymentStatus(
        order.id,
        (session.payment_intent as string) || session.id,
        PaymentStatus.COMPLETED,
        session.payment_method_details?.card?.brand || "Visa",
        session.payment_method_details?.card?.last4 || "4242"
      )

      // 6. Purge checkout cart
      const cart = await db.cart.findUnique({ where: { userId } })
      if (cart) {
        await db.cartItem.deleteMany({ where: { cartId: cart.id } })
      }

      // 7. Immutable audit log
      await db.auditLog.create({
        data: {
          userId,
          action: "ORDER_CHECKOUT_COMPLETED",
          entity: "Order",
          entityId: order.id,
        },
      })

      // 8. Mark webhook event as processed
      await db.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: { status: "PROCESSED", processedAt: new Date() },
      })

    } catch (checkoutError: any) {
      console.error("[Webhook] Critical checkout failure:", checkoutError.message)

      // Mark webhook event as failed
      await db.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          status: "FAILED",
          errorMessage: checkoutError.message,
          processedAt: new Date(),
        },
      }).catch(() => {})

      // Route to Dead Letter Queue for retry/escalation
      await sendToDLQ(
        event.id,
        "stripe_webhook",
        { eventType: event.type, sessionId: session.id, metadata: session.metadata },
        checkoutError.message
      ).catch((dlqErr) => {
        console.error("[Webhook] Failed to write to DLQ:", dlqErr.message)
      })

      // Return 200 to Stripe — do NOT let Stripe keep retrying (DLQ handles retry)
      return NextResponse.json(
        { received: true, status: "failed_routed_to_dlq" },
        { status: 200 }
      )
    }
  } else {
    // Non-checkout events: mark as processed immediately
    await db.webhookEvent.update({
      where: { id: webhookRecord.id },
      data: { status: "PROCESSED", processedAt: new Date() },
    })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}, { rateLimitNamespace: "stripe_webhook", rateLimit: { limit: 100, windowMs: 10000 } })
