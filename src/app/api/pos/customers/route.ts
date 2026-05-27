import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { withApiHandler } from "@/lib/api-middleware"
import { PosCustomerCreateSchema } from "@/validators/pos"

export const dynamic = "force-dynamic"

export const GET = withApiHandler(async (req: NextRequest) => {
  const customers = await db.user.findMany({
    where: { role: UserRole.CUSTOMER },
    include: {
      loyaltyPoint: true,
      storeCredits: true,
      addresses: {
        take: 1
      }
    }
  })

  const posCustomers = customers.map((c: any) => {
    const address = c.addresses[0]
    const totalCredit = c.storeCredits.reduce((sum: number, scr: any) => sum + scr.balance, 0)
    return {
      id: c.id,
      name: c.name || "Walk-in Customer",
      email: c.email,
      phone: address?.phone || "",
      points: c.loyaltyPoint?.pointsBalance || 0,
      isCreditCustomer: totalCredit > 0,
      creditLimit: totalCredit > 0 ? totalCredit * 2 : 10000,
      currentBalance: totalCredit,
      status: c.isActive ? 'ACTIVE' : 'BLOCKED',
      phones: [{ id: '1', phone1: address?.phone || '', phone2: null }]
    }
  })

  return NextResponse.json({ success: true, data: posCustomers })
}, { requireAdmin: true, rateLimitNamespace: "pos_customers" })

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json()

  // 1. Zod payload validation
  const validatedData = PosCustomerCreateSchema.safeParse(body)
  if (!validatedData.success) {
    return NextResponse.json({ 
      error: "Validation failed", 
      details: validatedData.error.format() 
    }, { status: 400 })
  }

  const { name, email, phone } = validatedData.data
  const emailValue = email || `customer-${Date.now()}@neoshop.ultra`
  const dummyPasswordHash = "$2a$10$dummyhashplaceholder..."

  // 2. Create user inside safe transaction
  const createdUser = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: emailValue,
        name,
        passwordHash: dummyPasswordHash,
        role: UserRole.CUSTOMER,
        loyaltyPoint: {
          create: { pointsBalance: 100 } // Welcome points!
        },
        addresses: {
          create: {
            line1: "Store Walk-in",
            city: "Local",
            state: "Local",
            postalCode: "00000",
            country: "US",
            phone: phone || "",
            isDefaultShipping: true
          }
        }
      },
      include: {
        loyaltyPoint: true,
        addresses: true
      }
    })

    return user
  })

  const address = createdUser.addresses[0]
  const posCustomer = {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    phone: address?.phone || "",
    points: createdUser.loyaltyPoint?.pointsBalance || 0,
    isCreditCustomer: false,
    creditLimit: 10000,
    currentBalance: 0,
    status: 'ACTIVE',
    phones: [{ id: '1', phone1: address?.phone || '', phone2: null }]
  }

  return NextResponse.json({ success: true, data: posCustomer })
}, { requireAdmin: true, rateLimitNamespace: "pos_customers_create" })
