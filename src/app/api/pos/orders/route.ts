import { db } from "@/lib/db"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerId, items, payment, note } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Checkout items are required" }, { status: 400 })
    }

    // 1. Resolve User and Addresses
    let customerUserId = customerId
    if (!customerUserId) {
      // Find default guest customer seeded user
      const guestCustomer = await db.user.findFirst({
        where: { email: "customer@neoshop.ultra" }
      })
      if (!guestCustomer) {
        return NextResponse.json({ error: "Default customer account not found" }, { status: 500 })
      }
      customerUserId = guestCustomer.id
    }

    const customerUser = await db.user.findUnique({
      where: { id: customerUserId },
      include: { addresses: true }
    })

    if (!customerUser) {
      return NextResponse.json({ error: "Customer account not found" }, { status: 404 })
    }

    const address = customerUser.addresses[0]
    if (!address) {
      return NextResponse.json({ error: "Customer profile must have at least one address" }, { status: 400 })
    }

    // 2. Compute financial breakdown
    let subtotal = 0
    for (const it of items) {
      subtotal += it.unitPrice * it.quantity
    }
    const tax = subtotal * 0.08 // NY tax or similar
    const total = subtotal + tax
    const orderNumber = `ORD-POS-${Date.now()}`

    // 3. PostgreSQL Transaction Scope
    const finalOrder = await db.$transaction(async (tx: any) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: customerUser.id,
          status: OrderStatus.PAID,
          subtotal,
          tax,
          shippingCost: 0, // In-store POS checkout
          discount: 0,
          total,
          shippingAddressId: address.id,
          billingAddressId: address.id,
          notes: note || "In-store POS Sale",
          items: {
            create: items.map((it: any) => ({
              variantId: it.variantId,
              quantity: it.quantity,
              price: it.unitPrice,
              total: it.unitPrice * it.quantity
            }))
          }
        },
        include: {
          items: true
        }
      })

      // Create Payment Log
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          gateway: payment.paymentType === "CREDIT" ? "STORE_CREDIT" : "POS_TERMINAL",
          transactionId: `TX-POS-${newOrder.id}-${Date.now()}`,
          amount: total,
          status: PaymentStatus.COMPLETED
        }
      })

      // Update Inventory
      for (const it of items) {
        const inventory = await tx.inventory.findFirst({
          where: { variantId: it.variantId }
        })

        if (inventory) {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              quantity: {
                decrement: it.quantity
              }
            }
          })

          // Add movement log
          await tx.inventoryMovement.create({
            data: {
              inventoryId: inventory.id,
              quantity: -it.quantity,
              type: "SHIPMENT",
              reason: `POS sale checkout: ${orderNumber}`
            }
          })
        }
      }

      return newOrder
    })

    // 4. Map for Frontend compatibility
    const responseData = {
      orderId: finalOrder.id,
      orderNumber: finalOrder.orderNumber,
      orderStatus: finalOrder.status,
      createdAt: finalOrder.createdAt,
      totalAmount: finalOrder.total,
      subTotal: finalOrder.subtotal,
      discountAmount: finalOrder.discount,
      tax: finalOrder.tax,
      payments: [{
        paymentType: payment.paymentType,
        amount: payment.amount,
        paymentDetails: [{
          cashReceived: payment.cashReceived || null,
          changeToGive: payment.changeToGive || null
        }]
      }],
      orderItems: finalOrder.items.map((i: any) => ({
        productName: "POS Item",
        variantName: "",
        quantity: i.quantity,
        unitPrice: i.price,
        total: i.total
      }))
    }

    return NextResponse.json({ success: true, data: responseData })
  } catch (error) {
    console.error("API POS Orders Checkout Error:", error)
    return NextResponse.json({ error: "POS order placement failed" }, { status: 500 })
  }
}
