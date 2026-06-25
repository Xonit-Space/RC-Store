"use server"

import { db } from "@/lib/db"

export async function getTaxRateByRegionCode(code: string): Promise<number> {
  try {
    const region = await db.region.findUnique({
      where: { code },
      include: { taxRate: true }
    })

    if (region?.taxRate?.isActive) {
      return Number(region.taxRate.rate)
    }
    
    // Fallback default tax rate if not found
    return 0.08
  } catch (error) {
    console.error("Error fetching tax rate:", error)
    return 0.08
  }
}
