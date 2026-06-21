import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { addStock } from "@/services/inventory"

// Admin-only, always fresh (stock levels change on every order)
export const dynamic = "force-dynamic"

export const GET = withApiHandler(async (req: NextRequest) => {
  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 200)
  const skip = (page - 1) * limit

  const [inventories, total] = await Promise.all([
    db.inventory.findMany({
      skip,
      take: limit,
      // Use select instead of include: { variant: { include: { product: true } } }
      // That old pattern loaded ALL product columns (description, metadata, etc.)
      select: {
        id: true,
        quantity: true,
        reserved: true,
        variant: {
          select: {
            sku: true,
            size: true,
            color: true,
            product: {
              select: { name: true }
            }
          }
        },
        warehouse: {
          select: { name: true }
        }
      },
      orderBy: { variantId: "asc" }
    }),
    db.inventory.count(),
  ])

  return NextResponse.json({
    success: true,
    data: inventories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  })
}, { requireAdmin: true, rateLimitNamespace: "admin_inventory_list" })

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { variantId, quantity } = body

  if (!variantId || typeof quantity !== "number") {
    return NextResponse.json({ error: "Invalid variantId or quantity" }, { status: 400 })
  }

  // Bounds check: prevent negative stock adjustments that would corrupt inventory
  if (quantity === 0) {
    return NextResponse.json({ error: "Quantity cannot be zero" }, { status: 400 })
  }

  // Update inventory level securely using select-for-update transaction
  const updated = await addStock(variantId, quantity, undefined, "Manual back-office adjustment overrides")

  return NextResponse.json({ success: true, data: updated })
}, { requireAdmin: true, rateLimitNamespace: "admin_inventory_update" })
