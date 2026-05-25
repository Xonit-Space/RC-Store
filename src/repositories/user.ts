import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    include: {
      addresses: true,
    },
  })
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
    include: {
      addresses: true,
    },
  })
}

export interface CreateUserInput {
  email: string
  passwordHash: string
  name: string
  role?: UserRole
}

export async function createUser(input: CreateUserInput) {
  return db.user.create({
    data: {
      email: input.email,
      passwordHash: input.passwordHash,
      name: input.name,
      role: input.role || "CUSTOMER",
    },
  })
}

export async function updateUserProfile(id: string, data: { name?: string; avatar?: string }) {
  return db.user.update({
    where: { id },
    data,
  })
}

export async function addAddress(userId: string, addressData: {
  title: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  isDefaultShipping: boolean
  isDefaultBilling: boolean
}) {
  return db.$transaction(async (tx) => {
    // If setting default, unset other addresses defaults first
    if (addressData.isDefaultShipping) {
      await tx.address.updateMany({
        where: { userId, isDefaultShipping: true },
        data: { isDefaultShipping: false },
      })
    }
    if (addressData.isDefaultBilling) {
      await tx.address.updateMany({
        where: { userId, isDefaultBilling: true },
        data: { isDefaultBilling: false },
      })
    }

    return tx.address.create({
      data: {
        userId,
        ...addressData,
      },
    })
  })
}

export async function deleteAddress(id: string, userId: string) {
  return db.address.delete({
    where: { id, userId },
  })
}
