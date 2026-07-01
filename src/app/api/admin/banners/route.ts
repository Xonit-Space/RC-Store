import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"

export const dynamic = "force-dynamic"

export const GET = withApiHandler(async (req: NextRequest) => {
  const banners = await db.imageBanner.findMany({
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json({ success: true, data: banners })
}, { requireAdmin: true, rateLimitNamespace: "admin_banners_list" })

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { position, title, desktopImage, tabletImage, mobileImage, link, isActive } = body

  if (!position || !desktopImage || !tabletImage || !mobileImage) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const upsertedBanner = await db.imageBanner.upsert({
    where: { position },
    update: {
      title,
      desktopImage,
      tabletImage,
      mobileImage,
      link,
      isActive: isActive ?? true
    },
    create: {
      position,
      title,
      desktopImage,
      tabletImage,
      mobileImage,
      link,
      isActive: isActive ?? true
    }
  })

  await db.auditLog.create({
    data: {
      action: "IMAGE_BANNER_UPSERT",
      entity: "ImageBanner",
      entityId: upsertedBanner.id,
      changes: JSON.stringify({ position, title, link, isActive })
    }
  }).catch(() => {})

  return NextResponse.json({ success: true, data: upsertedBanner })
}, { requireAdmin: true, rateLimitNamespace: "admin_banners_upsert" })
