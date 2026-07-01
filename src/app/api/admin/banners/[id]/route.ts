import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"

export const dynamic = "force-dynamic"

export const DELETE = withApiHandler(async (
  req: NextRequest,
  { params }: any
) => {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: "Banner ID is required" }, { status: 400 })
  }

  const deletedBanner = await db.imageBanner.delete({
    where: { id },
  })

  await db.auditLog.create({
    data: {
      action: "IMAGE_BANNER_DELETE",
      entity: "ImageBanner",
      entityId: deletedBanner.id,
      changes: JSON.stringify({ position: deletedBanner.position })
    }
  }).catch(() => {})

  return NextResponse.json({ success: true, data: deletedBanner })
}, { requireAdmin: true, rateLimitNamespace: "admin_banners_delete" })

export const PATCH = withApiHandler(async (
  req: NextRequest,
  { params }: any
) => {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: "Banner ID is required" }, { status: 400 })
  }

  const body = await req.json()
  const { isActive } = body

  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
  }

  const updatedBanner = await db.imageBanner.update({
    where: { id },
    data: { isActive },
  })

  await db.auditLog.create({
    data: {
      action: "IMAGE_BANNER_STATUS_UPDATE",
      entity: "ImageBanner",
      entityId: updatedBanner.id,
      changes: JSON.stringify({ isActive })
    }
  }).catch(() => {})

  return NextResponse.json({ success: true, data: updatedBanner })
}, { requireAdmin: true, rateLimitNamespace: "admin_banners_update" })
