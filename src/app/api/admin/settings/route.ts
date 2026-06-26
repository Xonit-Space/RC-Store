import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const settings = await db.siteSetting.findMany()
    
    // Convert array to key-value map
    const settingsMap: Record<string, string> = {}
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value
    })

    return NextResponse.json({ success: true, data: settingsMap })
  } catch (error: any) {
    console.error("Settings GET error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    
    // Process each key-value pair and upsert
    const updatePromises = Object.entries(body).map(([key, value]) => {
      return db.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Settings PATCH error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    )
  }
}
