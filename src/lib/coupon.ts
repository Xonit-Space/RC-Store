import { db } from "@/lib/db"

export async function validateAndCalculateCoupon(code: string, subtotal: number) {
  const normalizedCode = code.trim().toUpperCase()

  const coupon = await db.coupon.findUnique({
    where: { code: normalizedCode },
  })

  if (!coupon || !coupon.isActive) {
    return { success: false, error: "This coupon is either invalid or inactive" }
  }

  const now = new Date()
  if (now < coupon.startDate || now > coupon.endDate) {
    return { success: false, error: "This coupon code has expired" }
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { success: false, error: "The usage limit for this coupon has been reached" }
  }

  if (subtotal < Number(coupon.minOrderAmount)) {
    return {
      success: false,
      error: `Minimum subtotal of ${Number(coupon.minOrderAmount).toLocaleString("en-AU", {style: 'currency', currency: 'AUD'})} is required to apply this coupon`,
    }
  }

  let discount = 0
  if (coupon.discountType === "PERCENTAGE") {
    discount = (subtotal * Number(coupon.discountValue)) / 100
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, Number(coupon.maxDiscountAmount))
    }
  } else {
    discount = Number(coupon.discountValue)
  }

  return {
    success: true,
    data: {
      id: coupon.id,
      code: coupon.code,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
  }
}
