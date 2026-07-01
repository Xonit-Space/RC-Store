import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { AddressSchema } from "@/validators/auth"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { isDefaultShipping, isDefaultBilling, ...addressData } = body

    const validation = AddressSchema.safeParse(addressData)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Invalid data", details: validation.error }, { status: 400 })
    }

    // Ensure user owns the address
    const existing = await db.address.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 })
    }

    // If setting as default, unset others first
    if (isDefaultShipping) {
      await db.address.updateMany({
        where: { userId: session.user.id, id: { not: params.id } },
        data: { isDefaultShipping: false }
      })
    }
    if (isDefaultBilling) {
      await db.address.updateMany({
        where: { userId: session.user.id, id: { not: params.id } },
        data: { isDefaultBilling: false }
      })
    }

    const updated = await db.address.update({
      where: { id: params.id },
      data: {
        ...validation.data,
        isDefaultShipping: isDefaultShipping ?? existing.isDefaultShipping,
        isDefaultBilling: isDefaultBilling ?? existing.isDefaultBilling,
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("Update address error:", error)
    return NextResponse.json({ success: false, error: "Failed to update address" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const existing = await db.address.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 })
    }

    await db.address.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete address error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete address" }, { status: 500 })
  }
}
