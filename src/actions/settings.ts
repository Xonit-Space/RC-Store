"use server"

import { db } from "@/lib/db"
import { ActionResponse } from "./auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Ensure only ADMIN/SUPER_ADMIN can call admin settings actions
async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }
  const role = session.user.role as UserRole
  if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new Error("Forbidden")
  }
  return session.user
}

export async function getSiteSettings(): Promise<ActionResponse<Record<string, string>>> {
  try {
    const settings = await db.siteSetting.findMany()
    const formatted: Record<string, string> = {}
    settings.forEach((s) => {
      formatted[s.key] = s.value
    })
    
    // Set some defaults if not present
    if (!formatted["store_name"]) formatted["store_name"] = "NeoShop Ultra"
    if (!formatted["store_email"]) formatted["store_email"] = "support@neoshopultra.com"
    if (!formatted["store_phone"]) formatted["store_phone"] = "+94 77 123 4567"
    if (!formatted["store_status_open"]) formatted["store_status_open"] = "true"
    if (!formatted["free_shipping_threshold"]) formatted["free_shipping_threshold"] = "150.0"
    if (!formatted["tax_rate"]) formatted["tax_rate"] = "12.0"
    if (!formatted["currency"]) formatted["currency"] = "LKR"
    if (!formatted["stripe_enabled"]) formatted["stripe_enabled"] = "true"
    if (!formatted["pos_sync_enabled"]) formatted["pos_sync_enabled"] = "true"
    if (!formatted["courier_auto_assign"]) formatted["courier_auto_assign"] = "false"

    return { success: true, data: formatted }
  } catch (error: any) {
    console.error("Get Site Settings Error:", error)
    return { success: false, error: "Failed to fetch site settings" }
  }
}

export async function updateSiteSettingsBulk(
  settings: Record<string, string>
): Promise<ActionResponse> {
  try {
    const user = await requireAdmin()

    // Upsert each site setting key/value pair
    const ops = Object.entries(settings).map(([key, value]) =>
      db.siteSetting.upsert({
        where: { key },
        update: { value, updatedAt: new Date() },
        create: { key, value },
      })
    )

    await db.$transaction(ops)

    // Write admin audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "SITE_SETTINGS_UPDATE",
        entity: "SiteSetting",
        entityId: "SYSTEM",
        changes: JSON.stringify(settings),
      },
    }).catch((e) => {
      console.error("Audit log creation error:", e)
    })

    revalidatePath("/admin/settings")
    revalidatePath("/")

    return { success: true }
  } catch (error: any) {
    console.error("Update Site Settings Error:", error)
    return { success: false, error: error.message || "Failed to save site settings" }
  }
}

export async function getRecentAuditLogs(): Promise<ActionResponse<any[]>> {
  try {
    await requireAdmin()

    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return { success: true, data: logs }
  } catch (error: any) {
    console.error("Get Recent Audit Logs Error:", error)
    return { success: false, error: error.message || "Failed to fetch audit logs" }
  }
}

