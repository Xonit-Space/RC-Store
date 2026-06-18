"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { db } from "@/lib/db"

export async function addToCart(variantId: string, quantity: number, userId?: string, guestSessionId?: string) {
  if (!userId && !guestSessionId) {
    throw new Error("User ID or Guest Session ID is required to add to cart.")
  }

  // 1. Find or create the Cart
  let cart = await db.cart.findFirst({
    where: {
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(guestSessionId ? [{ guestSessionId }] : []),
      ]
    }
  })

  if (!cart) {
    cart = await db.cart.create({
      data: {
        userId,
        guestSessionId
      }
    })
  }

  // 2. Check if item exists in the cart
  const existingItem = await db.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId
      }
    }
  })

  // 3. Upsert item
  if (existingItem) {
    await db.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity }
    })
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        variantId,
        quantity
      }
    })
  }

  // 4. Invalidate cache for the frontend to update automatically
  revalidatePath("/")
  revalidatePath("/cart")
  revalidateTag("cart")

  return { success: true }
}

export async function removeFromCart(itemId: string) {
  await db.cartItem.delete({
    where: { id: itemId }
  })
  
  revalidatePath("/cart")
  revalidateTag("cart")
  return { success: true }
}
