import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { addStock } from "@/services/inventory"

export const dynamic = "force-dynamic"

export const GET = withApiHandler(async (req: NextRequest) => {
  const inventories = await db.inventory.findMany({
    include: {
      variant: {
        include: {
          product: true
        }
      }
    },
    orderBy: { variantId: "asc" }
  })

  return NextResponse.json(inventories)
}, { requireAdmin: true, rateLimitNamespace: "admin_inventory_list" })

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json()
  const { variantId, quantity } = body

  if (!variantId || typeof quantity !== "number") {
    return NextResponse.json({ error: "Invalid variantId or quantity" }, { status: 400 })
  }

  // Update inventory level securely using select-for-update transaction
  const updated = await addStock(variantId, quantity, undefined, "Manual back-office adjustment overrides")

  return NextResponse.json({ success: true, data: updated })
}, { requireAdmin: true, rateLimitNamespace: "admin_inventory_update" })
