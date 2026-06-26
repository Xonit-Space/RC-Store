import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Fetch promotion settings from SiteSetting
    const settings = await db.siteSetting.findMany({
      where: {
        key: { in: ["promo_title", "promo_end_date", "promo_active"] }
      }
    })

    const promoMap: Record<string, string> = {}
    settings.forEach(s => promoMap[s.key] = s.value)

    const isActive = promoMap["promo_active"] === "true"

    if (!isActive) {
      return NextResponse.json({ success: true, data: null })
    }

    // Determine target date
    let endDate = promoMap["promo_end_date"]
    if (!endDate) {
      // Default to EOFY next year if missing
      const nextYear = new Date().getFullYear() + 1
      endDate = `${nextYear}-06-30T23:59:59Z`
    }

    return NextResponse.json({
      success: true,
      data: {
        title: promoMap["promo_title"] || "EOFY Sale",
        endDate
      }
    })
  } catch (error: any) {
    console.error("Promotion API Error:", error)
    return NextResponse.json({ success: false, error: "Failed to load promotion data" }, { status: 500 })
  }
}
