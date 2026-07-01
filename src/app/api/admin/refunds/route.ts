import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { withApiHandler } from "@/lib/api-middleware"
import { serializeForClient } from "@/lib/serialize"

export const GET = withApiHandler(async (request, session) => {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  const where = status ? { status: status as any } : {}

  const requests = await db.returnRequest.findMany({
    where,
    include: {
      order: {
        include: {
          items: {
            include: {
              variant: {
                include: { product: true }
              }
            }
          }
        }
      },
      user: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ success: true, data: serializeForClient(requests) })
}, { requireAdmin: true })

export const PATCH = withApiHandler(async (request, session) => {
  const { id, status } = await request.json()

  if (!id || !status) {
    return NextResponse.json({ success: false, error: "ID and status are required" }, { status: 400 })
  }

  const returnRequest = await db.returnRequest.findUnique({
    where: { id },
    include: { order: true }
  })

  if (!returnRequest) {
    return NextResponse.json({ success: false, error: "Return request not found" }, { status: 404 })
  }

  // Update return request status
  const updated = await db.returnRequest.update({
    where: { id },
    data: { status }
  })

  // If approved, create a refund record (or simulate it depending on the payment gateway integration)
  if (status === "APPROVED") {
    // In a real system, you would call Stripe/PayPal API here
    const existingRefund = await db.refund.findFirst({
      where: { orderId: returnRequest.orderId }
    })
    
    if (!existingRefund) {
      await db.refund.create({
        data: {
          orderId: returnRequest.orderId,
          amount: returnRequest.order.total,
          status: "COMPLETED",
          gatewayReference: `REF-${Date.now()}`
        }
      })

      // Update order status to REFUNDED
      await db.order.update({
        where: { id: returnRequest.orderId },
        data: { status: "REFUNDED" }
      })
    }
  }

  // Audit log
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE_RETURN_REQUEST",
      entity: "ReturnRequest",
      entityId: id,
      changes: JSON.stringify({ status })
    }
  }).catch(() => {})

  return NextResponse.json({ success: true, data: serializeForClient(updated) })
}, { requireAdmin: true })
