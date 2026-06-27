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
  isActive: boolean
}) {
  try {
    const rule = await db.shippingRule.create({
      data: {
        name: data.name,
        minOrderAmount: data.minOrderAmount,
        maxOrderAmount: data.maxOrderAmount,
        shippingCost: data.shippingCost,
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

export async function calculateShippingCost(subtotal: number): Promise<number> {
  try {
    const rules = await db.shippingRule.findMany({
      where: { isActive: true },
    })

    if (!rules || rules.length === 0) {
      // Default fallback if no rules
      return 15;
    }

    // Sort descending by minOrderAmount to evaluate higher thresholds first
    rules.sort((a, b) => {
      const aMin = a.minOrderAmount ? Number(a.minOrderAmount) : 0;
      const bMin = b.minOrderAmount ? Number(b.minOrderAmount) : 0;
      return bMin - aMin;
    });

    for (const rule of rules) {
      const min = rule.minOrderAmount ? Number(rule.minOrderAmount) : null;
      const max = rule.maxOrderAmount ? Number(rule.maxOrderAmount) : null;
      
      let match = true;
      if (min !== null && subtotal < min) match = false;
      if (max !== null && subtotal > max) match = false;

      if (match) {
        return Number(rule.shippingCost);
      }
    }

    // Default if no rule matches
    return 15;
  } catch (error) {
    console.error("Error calculating shipping cost:", error)
    return 15;
  }
}
