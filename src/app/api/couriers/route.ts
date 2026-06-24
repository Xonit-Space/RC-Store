import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { CourierCreateSchema } from "@/validators/courier"

export const dynamic = "force-dynamic"

export const GET = withApiHandler(async (req: NextRequest) => {
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
}, { requireAdmin: true, rateLimitNamespace: "couriers_get" })

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json()

  // Zod Input Validation
  const validated = CourierCreateSchema.safeParse(body)
  if (!validated.success) {
    return NextResponse.json({ 
      error: "Validation failed", 
      details: validated.error.format() 
    }, { status: 400 })
  }

  const { name, phone, email, isActive } = validated.data

  const createdCourier = await db.courier.create({
    data: {
      name,
      phone: phone || null,
      email: email || null,
      isActive: isActive
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
}, { requireAdmin: true, rateLimitNamespace: "couriers_post" })
