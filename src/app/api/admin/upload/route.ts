import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadMedia } from "@/services/cloudinary"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
  ) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "rc-store/admin"

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Determine resource type based on mime type
    let resourceType: "image" | "video" | "raw" = "image"
    if (file.type.startsWith("video/")) {
      resourceType = "video"
    } else if (file.type === "application/pdf" || file.type.includes("document") || file.type.includes("text/")) {
      resourceType = "raw"
    } else if (!file.type.startsWith("image/")) {
       return NextResponse.json(
        { success: false, error: "Unsupported file type." },
        { status: 400 }
      )
    }

    // Validate file size (max 20MB for videos, 5MB for images/docs)
    const maxSize = resourceType === "video" ? 20 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` },
        { status: 400 }
      )
    }

    // Convert File to base64 data URI for Cloudinary SDK
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataUri = `data:${file.type};base64,${base64}`

    const url = await uploadMedia(dataUri, folder, resourceType)

    return NextResponse.json({ success: true, url })
  } catch (error: any) {
    console.error("Media upload error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Upload failed" },
      { status: 500 }
    )
  }
}
