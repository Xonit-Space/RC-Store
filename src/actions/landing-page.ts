"use server"

import { db } from "@/lib/db"
import { unstable_cache } from "next/cache"
import { ActionResponse } from "./auth"
import { serializeForClient } from "@/lib/serialize"

export const getFeaturedProduct = unstable_cache(
  async () => {
  try {
    const product = await db.product.findFirst({
      where: {
        isFeatured: true,
        isActive: true,
        deletedAt: null,
      },
      include: {
        images: {
          take: 1,
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })
    return product ? serializeForClient(product) : null
  } catch (error) {
    console.error("Failed to fetch featured product:", error)
    return null
  }
}, ["landing-featured"], { revalidate: 3600, tags: ["products"] })

export const getShopCategories = unstable_cache(
  async () => {
  try {
    const categories = await db.category.findMany({
      where: {
        parentId: null,
      },
      take: 6,
      orderBy: {
        createdAt: "asc",
      },
    })
    return categories
  } catch (error) {
    console.error("Failed to fetch shop categories:", error)
    return []
  }
}, ["landing-categories"], { revalidate: 86400, tags: ["categories"] })

export const getBestSellers = unstable_cache(
  async () => {
  try {
    // For now, return top selling active products grouped by a mocked logic or category.
    const products = await db.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: {
        salesCount: "desc",
      },
      take: 12,
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        category: true,
        reviews: { select: { rating: true } },
      },
    })
    
    // Grouping logic for the tabs
    const grouped = {
      "Off-Road": products.slice(0, 4),
      "Crawlers": products.slice(4, 8),
      "On-Road": products.slice(8, 12),
    }
    
    return serializeForClient(grouped)
  } catch (error) {
    console.error("Failed to fetch best sellers:", error)
    return { "Off-Road": [], "Crawlers": [], "On-Road": [] }
  }
}, ["landing-best-sellers"], { revalidate: 3600, tags: ["products", "orders"] })

export const getBrands = unstable_cache(
  async () => {
  try {
    const brands = await db.brand.findMany({
      take: 10,
      orderBy: { name: "asc" },
    })
    return brands
  } catch (error) {
    console.error("Failed to fetch brands:", error)
    return []
  }
}, ["landing-brands"], { revalidate: 86400, tags: ["brands"] })

export const getVehicleMakesAndModels = unstable_cache(
  async () => {
  try {
    const makes = await db.vehicleMake.findMany({
      include: {
        models: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    })
    return makes
  } catch (error) {
    console.error("Failed to fetch vehicle makes:", error)
    return []
  }
}, ["landing-vehicles"], { revalidate: 86400, tags: ["vehicles"] })

export const getStaffPicks = unstable_cache(
  async () => {
  try {
    const picks = await db.staffPick.findMany({
      take: 4,
      orderBy: { sortOrder: "asc" },
      include: {
        user: { select: { name: true, image: true, avatar: true } },
        product: {
          include: {
            images: { take: 1, orderBy: { sortOrder: "asc" } },
            reviews: { select: { rating: true } },
          },
        },
      },
    })
    return serializeForClient(picks)
  } catch (error) {
    console.error("Failed to fetch staff picks:", error)
    return []
  }
}, ["landing-staff-picks"], { revalidate: 3600, tags: ["staff-picks"] })

export const getNewReleases = unstable_cache(
  async () => {
  try {
    const products = await db.product.findMany({
      where: {
        isActive: true,
        isNewRelease: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        reviews: { select: { rating: true } },
      },
    })
    return serializeForClient(products)
  } catch (error) {
    console.error("Failed to fetch new releases:", error)
    return []
  }
}, ["landing-new-releases"], { revalidate: 3600, tags: ["products"] })

export const getGalleryImages = unstable_cache(
  async () => {
  try {
    const images = await db.galleryImage.findMany({
      where: {
        isApproved: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
      take: 10,
    })
    return images
  } catch (error) {
    console.error("Failed to fetch gallery images:", error)
    return []
  }
}, ["landing-gallery"], { revalidate: 3600, tags: ["gallery"] })

export async function subscribeNewsletter(formData: FormData): Promise<ActionResponse> {
  const email = formData.get("email") as string
  const firstName = formData.get("firstName") as string
  
  if (!email || !firstName) {
    return { success: false, error: "First name and email are required" }
  }

  try {
    const existing = await db.emailSubscriber.findUnique({
      where: { email },
    })

    if (existing) {
      if (existing.status === "UNSUBSCRIBED") {
        await db.emailSubscriber.update({
          where: { email },
          data: { status: "ACTIVE", firstName },
        })
      }
      return { success: true, data: { message: "Already subscribed" } }
    }

    const token = Math.random().toString(36).substring(2, 15) // simple unsubscribe token

    await db.emailSubscriber.create({
      data: {
        email,
        firstName,
        token,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to subscribe newsletter:", error)
    return { success: false, error: "Subscription failed" }
  }
}

const getCachedRandomPartImages = unstable_cache(
  async () => {
    try {
      // Find all part images (limit to 50 to avoid massive query)
      const images = await db.productImage.findMany({
        where: {
          product: {
            category: {
              slug: { contains: "parts" }
            }
          }
        },
        take: 50,
      })
      
      if (images.length === 0) {
        // Fallback to any product images if no parts found
        const fallback = await db.productImage.findMany({ take: 20 })
        const shuffled = fallback.sort(() => 0.5 - Math.random())
        return shuffled.slice(0, 5).map(img => img.url)
      }

      // Shuffle and pick 5
      const shuffled = images.sort(() => 0.5 - Math.random())
      return shuffled.slice(0, 5).map(img => img.url)
    } catch (error) {
      console.error("Failed to fetch random part images:", error)
      return [
        "https://images.unsplash.com/photo-1563209503-623c2140f0c0?auto=format&fit=crop&q=80&w=600"
      ]
    }
  }, ["landing-part-images"], { revalidate: 3600 }
)

export async function getRandomPartImages() {
  return await getCachedRandomPartImages()
}
