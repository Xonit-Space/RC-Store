import { v2 as cloudinary } from "cloudinary"

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

// Initialize Cloudinary if keys are defined, else skip gracefully
if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
}

export async function uploadMedia(fileUri: string, folderName = "rc-store", resourceType: "image" | "video" | "raw" = "image") {
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary is not configured. Falling back to local placeholder.")
    return "/placeholder.svg?height=600&width=600"
  }

  try {
    const options: any = {
      folder: folderName,
      resource_type: resourceType,
    }
    
    // Only apply format restrictions and transformations for images
    if (resourceType === "image") {
      options.allowed_formats = ["jpg", "png", "webp", "jpeg"]
      options.transformation = [{ width: 1200, crop: "limit" }]
    } else if (resourceType === "video") {
      options.allowed_formats = ["mp4", "webm", "mov"]
    } else if (resourceType === "raw") {
      options.allowed_formats = ["pdf", "doc", "docx", "txt", "csv", "xlsx"]
    }

    const result = await cloudinary.uploader.upload(fileUri, options)
    return result.secure_url
  } catch (error) {
    console.error("Cloudinary upload failed:", error)
    throw new Error("Failed to upload media asset")
  }
}

export async function uploadImage(fileUri: string, folderName = "rc-store") {
  return uploadMedia(fileUri, folderName, "image")
}

/**
 * Enterprise Performance Optimizer:
 * Modifies Cloudinary URLs on the fly to inject automatic quality (q_auto) 
 * and automatic formatting (f_auto, e.g., serving WebP/AVIF if supported)
 */
export function getOptimizedImageUrl(url: string, options?: { width?: number; height?: number; crop?: string }) {
  if (!url || !url.includes("cloudinary.com")) return url

  const { width = 800, height, crop = "scale" } = options || {}
  const splitTerm = "/upload/"
  const parts = url.split(splitTerm)

  if (parts.length !== 2) return url

  let transformation = `f_auto,q_auto,w_${width}`
  if (height) {
    transformation += `,h_${height},c_${crop}`
  }

  return `${parts[0]}${splitTerm}${transformation}/${parts[1]}`
}
