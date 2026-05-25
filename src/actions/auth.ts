"use"

import { RegisterSchema, AddressSchema } from "@/validators/auth"
import { createUser, getUserByEmail, addAddress } from "@/repositories/user"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export type ActionResponse<T = any> = {
  success: boolean
  error?: string
  data?: T
}

export async function registerUser(formData: any): Promise<ActionResponse> {
  const result = RegisterSchema.safeParse(formData)

  if (!result.success) {
    const errorMsg = result.error.errors.map((e) => e.message).join(", ")
    return { success: false, error: errorMsg }
  }

  const { name, email, password } = result.data

  try {
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" }
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await createUser({
      email,
      passwordHash,
      name,
    })

    // Automatically provision a default empty Cart and Wishlist for the user
    await Promise.all([
      db.cart.create({ data: { userId: user.id } }),
      db.wishlist.create({ data: { userId: user.id } }),
      db.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_REGISTER",
          entity: "User",
          entityId: user.id,
        },
      }),
    ])

    return { success: true }
  } catch (error: any) {
    console.error("Registration Server Error:", error)
    return { success: false, error: "Internal server error occurred" }
  }
}

export async function addCustomerAddress(userId: string, addressData: any): Promise<ActionResponse> {
  const result = AddressSchema.safeParse(addressData)

  if (!result.success) {
    const errorMsg = result.error.errors.map((e) => e.message).join(", ")
    return { success: false, error: errorMsg }
  }

  try {
    const address = await addAddress(userId, result.data)
    return { success: true, data: address }
  } catch (error: any) {
    console.error("Add Address Server Error:", error)
    return { success: false, error: "Failed to add address record" }
  }
}
