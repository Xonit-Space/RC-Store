import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const [totalRevenue, totalOrders, totalUsers, recentOrders] = await Promise.all([
      db.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ["CANCELLED", "REFUNDED"] } }
      }),
      db.order.count({
        where: { status: { notIn: ["CANCELLED", "REFUNDED"] } }
      }),
      db.user.count({
        where: { role: "CUSTOMER" }
      }),
      db.order.findMany({
        take: 12,
        orderBy: { createdAt: "desc" },
        select: { id: true, total: true, createdAt: true, status: true }
      })
    ])

    const revenue = Number(totalRevenue._sum.total || 0)
    const avgBasket = totalOrders > 0 ? revenue / totalOrders : 0
    const annualized = revenue > 0 ? revenue * 12 : 0

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: revenue,
        totalOrders,
        totalUsers,
        avgBasket,
        annualized,
        recentOrders
      }
    })

  } catch (error: any) {
    console.error("Metrics fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch metrics" },
      { status: 500 }
    )
  }
}
