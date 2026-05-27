import Stripe from "stripe"
import { reserveStock } from "@/services/inventory"
import { inventoryQueue } from "@/lib/queue/queues"

if (!process.env.STRIPE_API_KEY) {
  throw new Error("Missing STRIPE_API_KEY environment variable")
}

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2024-04-10" as any, // Target stable Stripe API version
  typescript: true,
})

export interface CheckoutItem {
  name: string
  images: string[]
  price: number // in USD
  quantity: number
  variantId: string
}

export interface CheckoutSessionOptions {
  userId: string
  email: string
  items: CheckoutItem[]
  successUrl: string
  cancelUrl: string
  couponCode?: string
  shippingCost?: number
}

export async function createCheckoutSession(options: CheckoutSessionOptions) {
  const { userId, email, items, successUrl, cancelUrl, couponCode, shippingCost = 0 } = options

  // 1. Pessimistically reserve stock for items in transaction before generating session
  for (const item of items) {
    await reserveStock({ variantId: item.variantId, quantity: item.quantity })
  }

  const lineItems = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        images: item.images.length > 0 ? [item.images[0]] : [],
        metadata: {
          variantId: item.variantId,
        },
      },
      unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
    },
    quantity: item.quantity,
  }))

  // Generate unique internal tracking reference
  const orderNumber = `NS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

  // 2. Schedule delayed BullMQ job to automatically release reserved stock if cart is abandoned (15 mins TTL)
  try {
    await inventoryQueue.add(
      "release_reservation",
      {
        action: "RELEASE_RESERVATION",
        orderNumber,
        items: items.map(item => ({ variantId: item.variantId, quantity: item.quantity }))
      },
      {
        delay: 15 * 60 * 1000 // 15 minutes delay
      }
    )
  } catch (err) {
    console.error("Failed to enqueue delayed stock release job:", err)
  }

  // Map session payload parameters
  const sessionCreateParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    customer_email: email,
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order_no=${orderNumber}`,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      orderNumber,
      variantMapping: JSON.stringify(
        items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
      ),
    },
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU", "LK"], // Target primary delivery hubs
    },
    billing_address_collection: "required",
  }

  // Inject additional custom shipping additions if needed
  if (shippingCost > 0) {
    sessionCreateParams.shipping_options = [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: Math.round(shippingCost * 100),
            currency: "usd",
          },
          display_name: "Premium Ground Delivery",
        },
      },
    ]
  }

  const session = await stripe.checkout.sessions.create(sessionCreateParams)
  return {
    id: session.id,
    url: session.url,
    orderNumber,
  }
}

export async function refundPayment(transactionId: string, amount?: number) {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: transactionId,
  }

  if (amount) {
    refundParams.amount = Math.round(amount * 100) // cents
  }

  const refund = await stripe.refunds.create(refundParams)
  return refund
}

export async function validateWebhookEvent(body: string, signature: string, webhookSecret: string) {
  return stripe.webhooks.constructEvent(body, signature, webhookSecret)
}
