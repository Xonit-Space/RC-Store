import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, reason } = await request.json()

    if (!orderId || !reason) {
      return NextResponse.json({ success: false, error: "Order ID and reason are required" }, { status: 400 })
    }

    // Verify order belongs to user and is eligible for return
    const order = await db.order.findUnique({
      where: { id: orderId }
    })

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "DELIVERED") {
      return NextResponse.json({ success: false, error: "Only delivered orders can be refunded" }, { status: 400 })
    }

    // Check if a return request already exists
    const existing = await db.returnRequest.findFirst({
      where: { orderId: order.id }
    })

    if (existing) {
      return NextResponse.json({ success: false, error: "A return request already exists for this order" }, { status: 400 })
    }

    const returnRequest = await db.returnRequest.create({
      data: {
        orderId,
        userId: session.user.id,
        reason,
        status: "PENDING"
      }
    })

    return NextResponse.json({ success: true, data: returnRequest })
  } catch (error) {
    console.error("Return Request Error:", error)
    return NextResponse.json({ success: false, error: "Failed to submit return request" }, { status: 500 })
  }
}
