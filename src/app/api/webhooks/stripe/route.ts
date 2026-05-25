import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/services/stripe"
import { db } from "@/lib/db"
import { createOrder, updatePaymentStatus } from "@/repositories/order"
import { addAddress } from "@/repositories/user"
import { PaymentStatus } from "@prisma/client"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") || ""

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  let event: any

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  const session = event.data.object

  // 1. Process successful payment checkouts
  if (event.type === "checkout.session.completed") {
    const metadata = session.metadata
    if (!metadata || !metadata.userId || !metadata.orderNumber) {
      return NextResponse.json({ error: "Missing session tracking metadata" }, { status: 400 })
    }

    try {
      const { userId, orderNumber, variantMapping } = metadata
      const items = JSON.parse(variantMapping)

      // Retrieve customer shipping details from Stripe session payload
      const stripeShipping = session.shipping_details
      const stripeBilling = session.customer_details

      if (!stripeShipping || !stripeShipping.address) {
        throw new Error("Missing shipping addresses details in Stripe receipt")
      }

      // 1. Write shipping address into DB
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

      // 2. Write billing address into DB
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

      // 3. Reconstruct snapshot items for DB order writing
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

      // Calculate checkout pricing snapshots
      const subtotal = session.amount_subtotal ? session.amount_subtotal / 100 : 0
      const total = session.amount_total ? session.amount_total / 100 : 0
      const shippingCost = session.shipping_cost?.amount_subtotal ? session.shipping_cost.amount_subtotal / 100 : 0
      const discount = session.total_details?.amount_discount ? session.total_details.amount_discount / 100 : 0
      const tax = session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0

      // 4. Create Order inside isolated inventory transaction
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

      // 5. Update Payment parameters & order billing statuses
      await updatePaymentStatus(
        order.id,
        session.payment_intent as string || session.id,
        PaymentStatus.COMPLETED,
        session.payment_method_details?.card?.brand || "Visa",
        session.payment_method_details?.card?.last4 || "4242"
      )

      // 6. Purge active shopping carts
      const cart = await db.cart.findUnique({ where: { userId } })
      if (cart) {
        await db.cartItem.deleteMany({ where: { cartId: cart.id } })
      }

      // 7. Write audit log entries
      await db.auditLog.create({
        data: {
          userId,
          action: "ORDER_CHECKOUT_COMPLETED",
          entity: "Order",
          entityId: order.id,
        },
      })

    } catch (checkoutError: any) {
      console.error("Critical webhook checkout operation failure:", checkoutError)
      return NextResponse.json({ error: "Webhook processing transaction failed" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
