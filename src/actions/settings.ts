"use server"

import { db } from "@/lib/db"

export async function getStoreSettings() {
  try {
    const insuranceSetting = await db.siteSetting.findUnique({
      where: { key: "shippingInsuranceCost" },
    })
    
    const safeDropSetting = await db.siteSetting.findUnique({
      where: { key: "enableSafeDrop" },
    })

    const settings = {
      shippingInsuranceCost: insuranceSetting ? parseFloat(insuranceSetting.value) : 22.50,
      enableSafeDrop: safeDropSetting ? safeDropSetting.value === "true" : true,
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
    if (data.shippingInsuranceCost !== undefined) {
      await db.siteSetting.upsert({
        where: { key: "shippingInsuranceCost" },
        update: { value: data.shippingInsuranceCost.toString() },
        create: {
          key: "shippingInsuranceCost",
          value: data.shippingInsuranceCost.toString(),
          description: "Shipping insurance cost in default currency"
        },
      })
    }
    
    if (data.enableSafeDrop !== undefined) {
      await db.siteSetting.upsert({
        where: { key: "enableSafeDrop" },
        update: { value: data.enableSafeDrop.toString() },
        create: {
          key: "enableSafeDrop",
          value: data.enableSafeDrop.toString(),
          description: "Enable safe drop option during checkout"
        },
      })
    }

    const { data: updatedSettings } = await getStoreSettings()
    return { success: true, data: updatedSettings }
  } catch (error: any) {
    console.error("Failed to update store settings", error)
    return { success: false, error: "Failed to update store settings" }
  }
}
