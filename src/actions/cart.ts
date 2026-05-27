"use server"

import { db } from "@/lib/db"
import { ActionResponse } from "./auth"

export async function getCart(userId?: string, guestSessionId?: string) {
  if (!userId && !guestSessionId) return null

  return db.cart.findFirst({
    where: {
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(guestSessionId ? [{ guestSessionId }] : []),
      ],
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { images: true },
              },
            },
          },
        },
      },
    },
  })
}

export async function addCartItem(
  variantId: string,
  quantity: number,
  userId?: string,
  guestSessionId?: string
): Promise<ActionResponse> {
  try {
    // 1. Verify stock limits first
    const inventory = await db.inventory.findUnique({ where: { variantId } })
    if (!inventory || inventory.quantity < quantity) {
      return { success: false, error: "Requested quantity is not available in stock" }
    }

    // 2. Fetch or create dynamic Cart
    let cart = await db.cart.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(guestSessionId ? [{ guestSessionId }] : []),
        ],
      },
    })

    if (!cart) {
      cart = await db.cart.create({
        data: {
          ...(userId ? { userId } : { guestSessionId }),
        },
      })
    }

    // 3. Upsert Cart Item
    await db.cartItem.upsert({
      where: {
        cartId_variantId: { cartId: cart.id, variantId },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId: cart.id,
        variantId,
        quantity,
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error("Add Cart Item Action Error:", error)
    return { success: false, error: "Failed to update shopping cart" }
  }
}

export async function updateCartItemQty(
  cartItemId: string,
  quantity: number
): Promise<ActionResponse> {
  if (quantity <= 0) {
    return deleteCartItem(cartItemId)
  }

  try {
    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
    })

    if (!cartItem) return { success: false, error: "Item not found" }

    const inventory = await db.inventory.findUnique({
      where: { variantId: cartItem.variantId },
    })

    if (!inventory || inventory.quantity < quantity) {
      return { success: false, error: "Insufficient stock available" }
    }

    await db.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update item quantity" }
  }
}

export async function deleteCartItem(cartItemId: string): Promise<ActionResponse> {
  try {
    await db.cartItem.delete({ where: { id: cartItemId } })
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete item" }
  }
}

/**
 * Enterprise Guest Cart Merger:
 * Automatically migrates guest items into user account baskets during signin loops
 */
export async function mergeGuestCart(guestSessionId: string, userId: string): Promise<ActionResponse> {
  try {
    const [guestCart, userCart] = await Promise.all([
      db.cart.findUnique({
        where: { guestSessionId },
        include: { items: true },
      }),
      db.cart.findUnique({
        where: { userId },
        include: { items: true },
      }),
    ])

    if (!guestCart || guestCart.items.length === 0) return { success: true }

    // Ensure user has a cart
    let activeUserCart = userCart
    if (!activeUserCart) {
      activeUserCart = await db.cart.create({
        data: { userId },
        include: { items: true },
      })
    }

    // Merge each item with inventory checks
    for (const item of guestCart.items) {
      await db.cartItem.upsert({
        where: {
          cartId_variantId: { cartId: activeUserCart.id, variantId: item.variantId },
        },
        update: {
          quantity: { increment: item.quantity },
        },
        create: {
          cartId: activeUserCart.id,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      })
    }

    // Purge the temporary guest cart
    await db.cart.delete({ where: { id: guestCart.id } })

    return { success: true }
  } catch (error) {
    console.error("Cart Merge Action Error:", error)
    return { success: false, error: "Failed to merge checkout baskets" }
  }
}
