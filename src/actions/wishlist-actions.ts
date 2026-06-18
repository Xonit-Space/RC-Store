"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { db } from "@/lib/db"

export async function toggleWishlist(productId: string, userId: string) {
  if (!userId) {
    throw new Error("You must be logged in to modify your wishlist.")
  }

  let wishlist = await db.wishlist.findUnique({
    where: { userId }
  })

  if (!wishlist) {
    wishlist = await db.wishlist.create({
      data: { userId }
    })
  }

  // Check if item exists in wishlist
  const existingItem = await db.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId
      }
    }
  })

  let isAdded = false

  if (existingItem) {
    await db.wishlistItem.delete({
      where: { id: existingItem.id }
    })
    isAdded = false
  } else {
    await db.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId
      }
    })
    isAdded = true
  }

  revalidatePath("/")
  revalidatePath("/wishlist")
  revalidateTag("wishlist")

  return { success: true, isAdded }
}
