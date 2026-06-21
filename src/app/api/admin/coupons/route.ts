import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"

export const dynamic = "force-dynamic"

export const GET = withApiHandler(async (req: NextRequest) => {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json({ success: true, data: coupons })
}, { requireAdmin: true, rateLimitNamespace: "admin_coupons_list" })

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit } = body

  if (!code || !discountType || typeof discountValue !== "number") {
    return NextResponse.json({ error: "Invalid coupon parameters" }, { status: 400 })
  }

  const newCoupon = await db.coupon.create({
    data: {
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // default 30 days
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usedCount: 0,
      isActive: true
    }
  })

  // Write audit trail log entry
  await db.auditLog.create({
    data: {
      action: "COUPON_CREATE",
      entity: "Coupon",
      entityId: newCoupon.id,
      changes: JSON.stringify(body)
    }
  }).catch(() => {})

  return NextResponse.json({ success: true, data: newCoupon })
}, { requireAdmin: true, rateLimitNamespace: "admin_coupons_create" })
