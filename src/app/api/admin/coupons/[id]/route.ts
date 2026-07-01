import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"

export const dynamic = "force-dynamic"

export const PATCH = withApiHandler(async (
  req: NextRequest,
  { params }: any
) => {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 })
  }

  const body = await req.json()
  const { isActive } = body

  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
  }

  const updatedCoupon = await db.coupon.update({
    where: { id },
    data: { isActive },
  })

  // Write audit trail log entry
  await db.auditLog.create({
    data: {
      action: "COUPON_STATUS_UPDATE",
      entity: "Coupon",
      entityId: updatedCoupon.id,
      changes: JSON.stringify({ isActive })
    }
  }).catch(() => {})

  return NextResponse.json({ success: true, data: updatedCoupon })
}, { requireAdmin: true, rateLimitNamespace: "admin_coupons_update" })
