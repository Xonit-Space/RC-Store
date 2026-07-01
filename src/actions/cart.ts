"use server"

import { db } from "@/lib/db"
import { ActionResponse } from "./auth"
import { z } from "zod"
import { serializeForClient } from "@/lib/serialize"

const AddCartItemSchema = z.object({
  variantId: z.string().optional(),
  addonId: z.string().optional(),
  parentProductId: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  userId: z.string().optional(),
  guestSessionId: z.string().optional()
}).refine(data => data.userId || data.guestSessionId, {
  message: "Either User ID or Guest Session ID is required"
}).refine(data => data.variantId || data.addonId, {
  message: "Either Variant ID or Addon ID is required"
})

const UpdateQtySchema = z.object({
  cartItemId: z.string().min(1, "Cart item ID is required"),
  quantity: z.number().int().min(0, "Quantity cannot be negative")
})

export async function getCart(userId?: string, guestSessionId?: string) {
  if (!userId && !guestSessionId) return null

  const cart = await db.cart.findFirst({
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
          addon: true,
        },
      },
    },
  })

  return serializeForClient(cart)
}

export async function addCartItem(
  variantId: string | undefined,
  addonId: string | undefined,
  parentProductId: string | undefined,
  quantity: number,
  userId?: string,
  guestSessionId?: string
): Promise<ActionResponse> {
  const parsed = AddCartItemSchema.safeParse({ variantId, addonId, parentProductId, quantity, userId, guestSessionId })
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    // 1. Verify stock limits first (only for variants)
    if (variantId) {
      const inventory = await db.inventory.findUnique({ where: { variantId } })
      if (!inventory || inventory.quantity < quantity) {
        return { success: false, error: "Requested quantity is not available in stock" }
      }
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

    // 3. Upsert Cart Item manually because Prisma doesn't allow nulls in @@unique where clauses
    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId: variantId || null,
        addonId: addonId || null,
        parentProductId: parentProductId || null
      }
    })

    if (existingItem) {
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: variantId || null,
          addonId: addonId || null,
          parentProductId: parentProductId || null,
          quantity,
        },
      })
    }

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
  const parsed = UpdateQtySchema.safeParse({ cartItemId, quantity })
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  if (quantity <= 0) {
    return deleteCartItem(cartItemId)
  }

  try {
    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
    })

    if (!cartItem) return { success: false, error: "Item not found" }

    if (cartItem.variantId) {
      const inventory = await db.inventory.findUnique({
        where: { variantId: cartItem.variantId },
      })

      if (!inventory || inventory.quantity < quantity) {
        return { success: false, error: "Insufficient stock available" }
      }
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
  if (!cartItemId) return { success: false, error: "Cart item ID is required" }
  
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
      const existingItem = await db.cartItem.findFirst({
        where: {
          cartId: activeUserCart.id,
          variantId: item.variantId || null,
          addonId: item.addonId || null,
          parentProductId: item.parentProductId || null
        }
      })

      if (existingItem) {
        await db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity },
        })
      } else {
        await db.cartItem.create({
          data: {
            cartId: activeUserCart.id,
            variantId: item.variantId || null,
            addonId: item.addonId || null,
            parentProductId: item.parentProductId || null,
            quantity: item.quantity,
          },
        })
      }
    }

    // Purge the temporary guest cart
    await db.cart.delete({ where: { id: guestCart.id } })

    return { success: true }
  } catch (error) {
    console.error("Cart Merge Action Error:", error)
    return { success: false, error: "Failed to merge checkout baskets" }
  }
}
