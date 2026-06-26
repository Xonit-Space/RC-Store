import { NextRequest, NextResponse } from "next/server"
import { uploadMedia } from "@/services/cloudinary"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "rc-store/gallery"

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Determine resource type based on mime type
    // Public uploads only support images for the gallery
    if (!file.type.startsWith("image/")) {
       return NextResponse.json(
        { success: false, error: "Only image uploads are supported." },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB for images)
    const maxSize = 5 * 1024 * 1024
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

    const url = await uploadMedia(dataUri, folder, "image")

    return NextResponse.json({ success: true, url })
  } catch (error: any) {
    console.error("Media upload error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Upload failed" },
      { status: 500 }
    )
  }
}
