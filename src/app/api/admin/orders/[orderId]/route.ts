import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: { orderId: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Missing status field" }, { status: 400 })
    }

    const order = await db.order.update({
      where: { id: params.orderId },
      data: { status }
    })

    return NextResponse.json({ success: true, data: order })
  } catch (error: any) {
    console.error("Admin order status update error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    )
  }
}
