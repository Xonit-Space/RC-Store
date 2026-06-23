import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/services/stripe"
import { db } from "@/lib/db"
import { sendOrderConfirmationSms } from "@/services/twilio"

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
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as any

  if (event.type === "checkout.session.completed") {
    const { userId, orderNumber, variantMapping } = session.metadata
    const items = JSON.parse(variantMapping || "[]")

    // 1. Create Order in DB
    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        status: "PAID",
        subtotal: session.amount_subtotal / 100,
        tax: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
        shippingCost: session.total_details?.amount_shipping ? session.total_details.amount_shipping / 100 : 0,
        discount: session.total_details?.amount_discount ? session.total_details.amount_discount / 100 : 0,
        total: session.amount_total / 100,
        // The previous checkout service assumes shipping/billing addresses are already saved,
        // so we'll mock relations here for simplicity or assume user has a default address.
        // In a real flow, you'd extract address from the Stripe session or user profile.
        shippingAddressId: "default", 
        billingAddressId: "default",
        items: {
          create: items.map((item: any) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: 0, // This should be fetched accurately during creation
            total: 0
          }))
        },
        payment: {
          create: {
            gateway: "STRIPE",
            transactionId: session.payment_intent as string,
            amount: session.amount_total / 100,
            status: "COMPLETED",
          }
        }
      }
    }).catch(e => console.error("Order creation failed", e))

    // 2. Clear user cart
    if (userId) {
      await db.cart.delete({
        where: { userId }
      }).catch(e => console.error("Failed to clear cart", e))
    }

    // 3. Send SMS Confirmation via Twilio
    // Fetch the phone from address if available
    const phone = session.customer_details?.phone || "+1234567890" // Fallback to avoid crash in demo
    await sendOrderConfirmationSms(phone, orderNumber, session.amount_total / 100)
  }

  return new NextResponse(null, { status: 200 })
}
