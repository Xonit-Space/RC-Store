import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { emitDomainEvent } from "@/events/emitters/emitter"

/**
 * GET /api/cart — Fetch current user's cart
 */
export const GET = withApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cart = await db.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { where: { isFeatured: true }, take: 1 },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!cart) {
    return NextResponse.json({ cart: null, items: [], total: 0 })
  }

  const total = cart.items.reduce((sum, item) => {
    const price = item.variant.price ?? item.variant.product.price
    return sum + price * item.quantity
  }, 0)

  return NextResponse.json({ cart, items: cart.items, total })
}, { rateLimitNamespace: "api_cart" })

/**
 * POST /api/cart — Add or update an item in the cart
 */
export const POST = withApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { variantId, quantity } = await req.json()
  if (!variantId || typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ error: "Invalid variantId or quantity" }, { status: 400 })
  }

  const userId = session.user.id

  // Upsert cart
  const cart = await db.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })

  // Upsert cart item
  const existing = await db.cartItem.findFirst({
    where: { cartId: cart.id, variantId },
  })

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    })
  } else {
    await db.cartItem.create({
      data: { cartId: cart.id, variantId, quantity },
    })
  }

  // Emit CART_UPDATED event for real-time subscribers
  const updatedCart = await db.cart.findUnique({
    where: { id: cart.id },
    include: { items: { select: { variantId: true, quantity: true } } },
  })

  await emitDomainEvent("CART_UPDATED", {
    cartId: cart.id,
    userId,
    items: updatedCart!.items,
  })

  return NextResponse.json({ success: true, cartId: cart.id })
}, { rateLimitNamespace: "api_cart" })

/**
 * DELETE /api/cart — Remove item from cart
 */
export const DELETE = withApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { cartItemId } = await req.json()
  if (!cartItemId) {
    return NextResponse.json({ error: "Missing cartItemId" }, { status: 400 })
  }

  await db.cartItem.delete({ where: { id: cartItemId } })
  return NextResponse.json({ success: true })
}, { rateLimitNamespace: "api_cart" })
