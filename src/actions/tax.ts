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

export async function getTaxRates() {
  try {
    const rates = await db.taxRate.findMany({
      include: { region: true },
    })
    return { success: true, data: rates }
  } catch (error: any) {
    console.error("Failed to fetch tax rates", error)
    return { success: false, error: "Failed to fetch tax rates" }
  }
}

export async function updateTaxRate(id: string, rate: number, isActive: boolean) {
  try {
    const updated = await db.taxRate.update({
      where: { id },
      data: { rate, isActive },
    })
    return { success: true, data: updated }
  } catch (error: any) {
    console.error("Failed to update tax rate", error)
    return { success: false, error: "Failed to update tax rate" }
  }
}

export async function createTaxRate(name: string, rate: number, isActive: boolean) {
  try {
    const created = await db.taxRate.create({
      data: { name, rate, isActive },
    })
    return { success: true, data: created }
  } catch (error: any) {
    console.error("Failed to create tax rate", error)
    return { success: false, error: "Failed to create tax rate" }
  }
}

export async function deleteTaxRate(id: string) {
  try {
    await db.taxRate.delete({
      where: { id },
    })
    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete tax rate", error)
    return { success: false, error: "Failed to delete tax rate" }
  }
}

