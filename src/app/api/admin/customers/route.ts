export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "24", 10)
    
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: { role: "CUSTOMER" },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
          loyaltyPoint: {
            select: { pointsBalance: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where: { role: "CUSTOMER" } })
    ])

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.isActive ? "ACTIVE" : "INACTIVE",
      points: user.loyaltyPoint?.pointsBalance || 0,
      createdAt: user.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })

  } catch (error: any) {
    console.error("Customers fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "CUSTOMER",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...newUser,
        status: newUser.isActive ? "ACTIVE" : "INACTIVE",
        points: 0
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error("Create customer error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create customer" },
      { status: 500 }
    )
  }
}
