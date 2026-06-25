import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const settings = await db.siteSetting.findMany()
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json({ success: true, data: settingsMap })
  } catch (error) {
    console.error("Fetch settings error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    
    // Process each key-value pair and upsert
    const updates = Object.entries(body).map(async ([key, value]) => {
      if (typeof value === 'string') {
        return db.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        })
      }
    })

    await Promise.all(updates)

    return NextResponse.json({ success: true, message: "Settings updated" })
  } catch (error) {
    console.error("Update settings error:", error)
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
  }
}
