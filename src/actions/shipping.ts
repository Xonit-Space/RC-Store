"use server"

import { db } from "@/lib/db"

export async function getShippingRules() {
  try {
    const rules = await db.shippingRule.findMany({
      orderBy: { minOrderAmount: "asc" },
    })
    return { success: true, data: rules }
  } catch (error: any) {
    console.error("Failed to fetch shipping rules", error)
    return { success: false, error: "Failed to fetch shipping rules" }
  }
}

export async function createShippingRule(data: {
  name: string
  minOrderAmount?: number
  maxOrderAmount?: number
  shippingCost: number
  estimatedDaysMin?: number
  estimatedDaysMax?: number
  courierName?: string
  logoUrl?: string
  isActive: boolean
}) {
  try {
    const rule = await db.shippingRule.create({
      data: {
        name: data.name,
        minOrderAmount: data.minOrderAmount,
        maxOrderAmount: data.maxOrderAmount,
        shippingCost: data.shippingCost,
        estimatedDaysMin: data.estimatedDaysMin,
        estimatedDaysMax: data.estimatedDaysMax,
        courierName: data.courierName,
        logoUrl: data.logoUrl,
        isActive: data.isActive,
      },
    })
    return { success: true, data: rule }
  } catch (error: any) {
    console.error("Failed to create shipping rule", error)
    return { success: false, error: "Failed to create shipping rule" }
  }
}

export async function updateShippingRule(id: string, data: {
  name?: string
  minOrderAmount?: number | null
  maxOrderAmount?: number | null
  shippingCost?: number
  estimatedDaysMin?: number | null
  estimatedDaysMax?: number | null
  courierName?: string | null
  logoUrl?: string | null
  isActive?: boolean
}) {
  try {
    const rule = await db.shippingRule.update({
      where: { id },
      data,
    })
    return { success: true, data: rule }
  } catch (error: any) {
    console.error("Failed to update shipping rule", error)
    return { success: false, error: "Failed to update shipping rule" }
  }
}

export async function deleteShippingRule(id: string) {
  try {
    await db.shippingRule.delete({
      where: { id },
    })
    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete shipping rule", error)
    return { success: false, error: "Failed to delete shipping rule" }
  }
}

export async function getAvailableShippingOptions(subtotal: number) {
  try {
    const rules = await db.shippingRule.findMany({
      where: { isActive: true },
      orderBy: { shippingCost: "asc" },
    })

    if (!rules || rules.length === 0) {
      return []
    }

    const availableOptions = rules.filter(rule => {
      const min = rule.minOrderAmount ? Number(rule.minOrderAmount) : null;
      const max = rule.maxOrderAmount ? Number(rule.maxOrderAmount) : null;
      
      let match = true;
      if (min !== null && subtotal < min) match = false;
      if (max !== null && subtotal > max) match = false;
      return match;
    })

    return availableOptions;
  } catch (error) {
    console.error("Error getting available shipping options:", error)
    return [];
  }
}
