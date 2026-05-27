import { db } from "@/lib/db"
import { OrderStatus, PaymentStatus, InventoryMovementType } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { queueConnection } from "@/lib/queue/connection"
import { PosOrderCreateSchema } from "@/validators/pos"

export const dynamic = "force-dynamic"

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json()

  // 1. Zod Input Validation
  const validatedData = PosOrderCreateSchema.safeParse(body)
  if (!validatedData.success) {
    return NextResponse.json({ 
      error: "Validation failed", 
      details: validatedData.error.format() 
    }, { status: 400 })
  }

  const { customerId, items, payment, note, idempotencyKey } = validatedData.data
  const lockKey = `pos:idempotency:${idempotencyKey}`

  // 2. Redis-Backed Idempotency Guard
  try {
    const acquired = await queueConnection.set(lockKey, "processing", "EX", 86400, "NX")
    if (!acquired) {
      return NextResponse.json({ error: "Duplicate transaction request detected" }, { status: 409 })
    }
  } catch (redisError) {
    console.error("Idempotency Redis connection failure:", redisError)
    // Fail open or allow check to pass so POS stays up if Redis is offline
  }

  try {
    // 3. Resolve User and Addresses
    let customerUserId = customerId
    if (!customerUserId) {
      const guestCustomer = await db.user.findFirst({
        where: { email: "customer@neoshop.ultra" }
      })
      if (!guestCustomer) {
        throw new Error("Default customer account not found in database")
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

    // 4. Compute financial breakdown
    let subtotal = 0
    for (const it of items) {
      subtotal += it.unitPrice * it.quantity
    }
    const tax = Math.round(subtotal * 0.08 * 100) / 100
    const total = Math.round((subtotal + tax) * 100) / 100
    const orderNumber = `ORD-POS-${Date.now()}`

    // 5. PostgreSQL Pessimistic Transaction Scope
    const finalOrder = await db.$transaction(async (tx) => {
      // 5.1 Enforce Concurrency stock checks via Pessimistic SELECT FOR UPDATE
      for (const it of items) {
        const inventories = await tx.$queryRaw<any[]>`
          SELECT id, quantity, reserved FROM inventory
          WHERE "variantId" = ${it.variantId}
          FOR UPDATE
        `
        const inventory = inventories[0]

        if (!inventory) {
          throw new Error(`Product variant inventory record not found for variantId ${it.variantId}`)
        }

        const available = inventory.quantity - inventory.reserved
        if (available < it.quantity) {
          throw new Error(`Insufficient stock for item variant: ${it.variantId}. Available: ${available}, Requested: ${it.quantity}`)
        }

        // Decrement stock levels securely
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            quantity: {
              decrement: it.quantity
            }
          }
        })

        // Add inventory movement audit logs
        await tx.inventoryMovement.create({
          data: {
            inventoryId: inventory.id,
            quantity: -it.quantity,
            type: InventoryMovementType.SHIPMENT,
            reason: `POS sale checkout: ${orderNumber}`
          }
        })
      }

      // 5.2 Create the secure Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: customerUser.id,
          status: OrderStatus.PAID,
          subtotal,
          tax,
          shippingCost: 0,
          discount: 0,
          total,
          shippingAddressId: address.id,
          billingAddressId: address.id,
          items: {
            create: items.map((it) => ({
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

      // 5.3 Create Payment Log record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          gateway: payment.paymentType === "CREDIT" ? "STORE_CREDIT" : "POS_TERMINAL",
          transactionId: `TX-POS-${newOrder.id}-${Date.now()}`,
          amount: total,
          status: PaymentStatus.COMPLETED
        }
      })

      return newOrder
    }) as any

    // 6. Update Idempotency status to 'completed'
    await queueConnection.set(lockKey, "completed", "EX", 86400).catch(() => {})

    // 7. Map payload for POS Frontend compatibility
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

  } catch (error: any) {
    console.error("POS Orders Checkout Transaction Failed:", error)
    // Unlock on failure to permit safe retry attempt
    await queueConnection.del(lockKey).catch(() => {})

    return NextResponse.json({ 
      error: "POS transaction rejected", 
      message: error.message 
    }, { status: error.message.includes("Insufficient stock") ? 409 : 500 })
  }
}, { requireAdmin: true, rateLimitNamespace: "pos_orders" })
