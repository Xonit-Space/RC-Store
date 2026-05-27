import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export const GET = withApiHandler(async () => {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      addresses: true,
      loyaltyPoint: true,
      storeCredits: true,
    },
  })

  return NextResponse.json(profile)
}, { requireAuth: true, rateLimitNamespace: "api_customer_profile", rateLimit: { limit: 50, windowMs: 60000 } })

export const POST = withApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name } = body

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const updatedUser = await db.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() },
    select: { id: true, name: true, email: true }
  })

  // Write audit trail log entry
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "PROFILE_UPDATE",
      entity: "User",
      entityId: session.user.id,
      changes: JSON.stringify({ name })
    }
  }).catch(() => {})

  return NextResponse.json({ success: true, user: updatedUser })
}, { requireAuth: true, rateLimitNamespace: "api_customer_profile_update" })
