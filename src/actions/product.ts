"use server"

import { ProductService } from "@/services/product.service"
import { ReviewSchema, CmsProductSchema, CmsProductVariantSchema } from "@/validators/product"
import { createProductReview } from "@/repositories/product"
import { ActionResponse } from "./auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function submitReview(
  productId: string,
  userId: string,
  formData: any
): Promise<ActionResponse> {
  const result = ReviewSchema.safeParse(formData)

  if (!result.success) {
    const errorMsg = result.error.errors.map((e) => e.message).join(", ")
    return { success: false, error: errorMsg }
  }

  try {
    const review = await createProductReview(
      productId,
      userId,
      result.data.rating,
      result.data.comment || undefined
    )

    return { success: true, data: review }
  } catch (error) {
    console.error("Review Submit Action Error:", error)
    return { success: false, error: "Failed to submit review" }
  }
}

export async function adminCreateProduct(adminId: string, formData: any): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized access" }
  }

  const result = CmsProductSchema.safeParse(formData)

  if (!result.success) {
    const errorMsg = result.error.errors.map((e) => e.message).join(", ")
    return { success: false, error: errorMsg }
  }

  const data = result.data
  try {
    const product = await ProductService.createProduct(adminId, data)
    return { success: true, data: product }
  } catch (error) {
    console.error("CMS Product Create Action Error:", error)
    return { success: false, error: "Failed to create catalog product" }
  }
}

export async function adminUpdateProduct(adminId: string, productId: string, formData: any): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized access" }
  }

  const result = CmsProductSchema.safeParse(formData)

  if (!result.success) {
    const errorMsg = result.error.errors.map((e) => e.message).join(", ")
    return { success: false, error: errorMsg }
  }

  const data = result.data
  try {
    const product = await ProductService.updateProduct(adminId, productId, data)
    return { success: true, data: product }
  } catch (error) {
    console.error("CMS Product Update Action Error:", error)
    return { success: false, error: "Failed to update catalog product" }
  }
}

export async function adminAddVariant(
  adminId: string,
  productId: string,
  variantData: any
): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized access" }
  }

  const result = CmsProductVariantSchema.safeParse(variantData)

  if (!result.success) {
    const errorMsg = result.error.errors.map((e) => e.message).join(", ")
    return { success: false, error: errorMsg }
  }

  const data = result.data

  try {
    const variant = await ProductService.addVariant(adminId, productId, data)
    return { success: true, data: variant }
  } catch (error) {
    console.error("CMS Variant Create Action Error:", error)
    return { success: false, error: "Failed to create SKU variant" }
  }
}

export async function adminDeleteProduct(adminId: string, productId: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized access" }
  }

  try {
    await ProductService.softDeleteProduct(adminId, productId)
    return { success: true }
  } catch (error) {
    console.error("CMS Product Delete Action Error:", error)
    return { success: false, error: "Failed to delete product" }
  }
}
