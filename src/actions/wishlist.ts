"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getUserWishlist() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" }
    }

    const wishlist = await db.wishlist.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                variants: {
                  include: {
                    inventory: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    })

    return { success: true, data: wishlist?.items || [] }
  } catch (error: any) {
    console.error("Failed to fetch wishlist:", error)
    return { success: false, error: "Failed to load wishlist" }
  }
}

export async function toggleWishlist(productId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" }
    }

    // Ensure wishlist exists
    let wishlist = await db.wishlist.findUnique({
      where: { userId: session.user.id }
    })

    if (!wishlist) {
      wishlist = await db.wishlist.create({
        data: { userId: session.user.id }
      })
    }

    const existing = await db.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      }
    })

    if (existing) {
      await db.wishlistItem.delete({
        where: { id: existing.id }
      })
      revalidatePath("/wishlist")
      return { success: true, action: "removed" }
    } else {
      await db.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId
        }
      })
      revalidatePath("/wishlist")
      return { success: true, action: "added" }
    }
  } catch (error: any) {
    console.error("Failed to toggle wishlist:", error)
    return { success: false, error: "Failed to update wishlist" }
  }
}

export async function toggleRestockAlert(productId: string, enabled: boolean) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" }
    }

    let wishlist = await db.wishlist.findUnique({
      where: { userId: session.user.id }
    })

    if (!wishlist) {
      wishlist = await db.wishlist.create({
        data: { userId: session.user.id }
      })
    }

    const existing = await db.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      }
    })

    if (existing) {
      await db.wishlistItem.update({
        where: { id: existing.id },
        data: { notifyOnRestock: enabled }
      })
    } else {
      await db.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
          notifyOnRestock: enabled
        }
      })
    }

    revalidatePath("/wishlist")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to toggle restock alert:", error)
    return { success: false, error: "Failed to update restock alert" }
  }
}
