"use server"

import { db } from "@/lib/db"

export async function getStoreSettings() {
  try {
    let settings = await db.storeSettings.findUnique({
      where: { id: "global" },
    })

    if (!settings) {
      settings = await db.storeSettings.create({
        data: {
          id: "global",
          shippingInsuranceCost: 22.50,
          enableSafeDrop: true,
        },
      })
    }

    return { success: true, data: settings }
  } catch (error: any) {
    console.error("Failed to fetch store settings", error)
    return { success: false, error: "Failed to fetch store settings" }
  }
}

export async function updateStoreSettings(data: {
  shippingInsuranceCost?: number
  enableSafeDrop?: boolean
}) {
  try {
    const settings = await db.storeSettings.upsert({
      where: { id: "global" },
      update: {
        shippingInsuranceCost: data.shippingInsuranceCost,
        enableSafeDrop: data.enableSafeDrop,
      },
      create: {
        id: "global",
        shippingInsuranceCost: data.shippingInsuranceCost ?? 22.50,
        enableSafeDrop: data.enableSafeDrop ?? true,
      },
    })
    return { success: true, data: settings }
  } catch (error: any) {
    console.error("Failed to update store settings", error)
    return { success: false, error: "Failed to update store settings" }
  }
}
