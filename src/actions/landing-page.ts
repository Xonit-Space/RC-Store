"use server"

import { db } from "@/lib/db"
import { ActionResponse } from "./auth"

export async function getFeaturedProduct() {
  try {
    const product = await db.product.findFirst({
      where: {
        isFeatured: true,
        isActive: true,
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
    return product
  } catch (error) {
    console.error("Failed to fetch featured product:", error)
    return null
  }
}

export async function getShopCategories() {
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
}

export async function getBestSellers() {
  try {
    // For now, return top selling active products grouped by a mocked logic or category.
    const products = await db.product.findMany({
      where: {
        isActive: true,
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
    
    return grouped
  } catch (error) {
    console.error("Failed to fetch best sellers:", error)
    return { "Off-Road": [], "Crawlers": [], "On-Road": [] }
  }
}

export async function getBrands() {
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
}

export async function getVehicleMakesAndModels() {
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
}

export async function getStaffPicks() {
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
    return picks
  } catch (error) {
    console.error("Failed to fetch staff picks:", error)
    return []
  }
}

export async function getNewReleases() {
  try {
    const products = await db.product.findMany({
      where: {
        isActive: true,
        isNewRelease: true,
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
    return products
  } catch (error) {
    console.error("Failed to fetch new releases:", error)
    return []
  }
}

export async function getGalleryImages() {
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
}

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
