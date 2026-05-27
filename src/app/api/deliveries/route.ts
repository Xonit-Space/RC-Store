import { db } from "@/lib/db"
import { ShipmentStatus } from "@prisma/client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const shipments = await db.shipment.findMany({
      include: {
        order: {
          include: {
            user: {
              include: {
                addresses: {
                  take: 1
                }
              }
            }
          }
        },
        courier: true
      },
      orderBy: { createdAt: "desc" }
    })

    const formattedDeliveries = shipments.map((s: any) => {
      const address = s.order.user.addresses[0]
      const addressStr = address 
        ? `${address.line1}, ${address.city}, ${address.state} ${address.postalCode}`
        : "In-Store Pickup"
        
      let statusStr = "PENDING"
      if (s.status === ShipmentStatus.DELIVERED) statusStr = "DELIVERED"
      else if (s.status === ShipmentStatus.FAILED) statusStr = "RETURNED"
      else if (s.status === ShipmentStatus.IN_TRANSIT) statusStr = "DISPATCHED"
      else if (s.status === ShipmentStatus.LABEL_CREATED) statusStr = "PROCESSING"

      return {
        id: s.id,
        orderNumber: s.order.orderNumber,
        customerName: s.order.user.name || "Customer",
        customerPhone: address?.phone || s.order.user.email,
        address: addressStr,
        status: statusStr,
        estimatedDeliveryTime: s.estimatedDelivery || new Date(),
        trackingNumber: s.trackingNumber,
        courierId: s.courierId || undefined,
        courierName: s.courier?.name || undefined,
        notes: `Carrier: ${s.carrier}`,
        createdAt: s.createdAt
      }
    })

    return NextResponse.json({ success: true, data: formattedDeliveries })
  } catch (error) {
    console.error("API Deliveries GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 })
  }
}
