import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const couriers = await db.courier.findMany({
      orderBy: { createdAt: "desc" }
    })

    const formattedCouriers = couriers.map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone || "",
      email: c.email || "",
      status: c.isActive ? "ACTIVE" : "INACTIVE",
      isOnline: c.isActive,
      rating: 4.8,
      totalDeliveries: 120
    }))

    return NextResponse.json({ success: true, data: formattedCouriers })
  } catch (error) {
    console.error("API Couriers GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch couriers" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, phone, email, status } = body

    if (!name) {
      return NextResponse.json({ error: "Courier name is required" }, { status: 400 })
    }

    const createdCourier = await db.courier.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        isActive: status === "ACTIVE"
      }
    })

    const formattedCourier = {
      id: createdCourier.id,
      name: createdCourier.name,
      phone: createdCourier.phone || "",
      email: createdCourier.email || "",
      status: createdCourier.isActive ? "ACTIVE" : "INACTIVE",
      isOnline: createdCourier.isActive,
      rating: 5.0,
      totalDeliveries: 0
    }

    return NextResponse.json({ success: true, data: formattedCourier })
  } catch (error) {
    console.error("API Couriers POST Error:", error)
    return NextResponse.json({ error: "Failed to create courier" }, { status: 500 })
  }
}
