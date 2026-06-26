"use server"

import { ProductService } from "@/services/product.service"
import { ReviewSchema, CmsProductSchema, CmsProductVariantSchema } from "@/validators/product"
import { createProductReview } from "@/repositories/product"
import { ActionResponse } from "./auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function submitReview(
  productId: string,
  userId: string,
  formData: any
): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { success: false, error: "Unauthorized" }
  }
  const resolvedUserId = session.user.id
  const result = ReviewSchema.safeParse(formData)

  if (!result.success) {
    const errorMsg = result.error.errors.map((e) => e.message).join(", ")
    return { success: false, error: errorMsg }
  }

  try {
    const existing = await db.review.findFirst({
      where: { userId: resolvedUserId, productId }
    })

    if (existing) {
      return { success: false, error: "You have already reviewed this product" }
    }

    const review = await createProductReview(
      productId,
      resolvedUserId,
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
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
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
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
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
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
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
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
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

export async function adminAddProductVideo(productId: string, data: any): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized access" }
  }
  try {
    const video = await db.productVideo.create({
      data: {
        productId,
        title: data.title,
        url: data.url,
        type: data.type || "DEMO",
      }
    })
    return { success: true, data: video }
  } catch (error) {
    console.error("Add Video Error:", error)
    return { success: false, error: "Failed to add video" }
  }
}

export async function adminDeleteProductVideo(videoId: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized access" }
  }
  try {
    await db.productVideo.delete({ where: { id: videoId } })
    return { success: true }
  } catch (error) {
    console.error("Delete Video Error:", error)
    return { success: false, error: "Failed to delete video" }
  }
}

export async function adminAddProductDocument(productId: string, data: any): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized access" }
  }
  try {
    const doc = await db.productDocument.create({
      data: {
        productId,
        name: data.name,
        url: data.url,
        type: data.type || "MANUAL",
      }
    })
    return { success: true, data: doc }
  } catch (error) {
    console.error("Add Document Error:", error)
    return { success: false, error: "Failed to add document" }
  }
}

export async function adminDeleteProductDocument(documentId: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized access" }
  }
  try {
    await db.productDocument.delete({ where: { id: documentId } })
    return { success: true }
  } catch (error) {
    console.error("Delete Document Error:", error)
    return { success: false, error: "Failed to delete document" }
  }
}

export async function adminAddProductFeatureBlock(productId: string, data: any): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized access" }
  }
  try {
    const block = await db.productFeatureBlock.create({
      data: {
        productId,
        title: data.title,
        description: data.description,
        image: data.image || null,
      }
    })
    return { success: true, data: block }
  } catch (error) {
    console.error("Add Feature Block Error:", error)
    return { success: false, error: "Failed to add feature block" }
  }
}

export async function adminDeleteProductFeatureBlock(blockId: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized access" }
  }
  try {
    await db.productFeatureBlock.delete({ where: { id: blockId } })
    return { success: true }
  } catch (error) {
    console.error("Delete Feature Block Error:", error)
    return { success: false, error: "Failed to delete feature block" }
  }
}

export async function adminAddRelatedProduct(productId: string, data: any): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized access" }
  }
  try {
    const related = await db.relatedProduct.create({
      data: {
        productId,
        relatedId: data.relatedId,
        relationType: data.relationType || "COMPATIBLE",
      }
    })
    return { success: true, data: related }
  } catch (error) {
    console.error("Add Related Product Error:", error)
    return { success: false, error: "Failed to add related product (maybe duplicate?)" }
  }
}

export async function adminDeleteRelatedProduct(relatedId: string, productId: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized access" }
  }
  try {
    // Delete by unique constraint
    await db.relatedProduct.delete({
      where: {
        productId_relatedId: {
          productId,
          relatedId
        }
      }
    })
    return { success: true }
  } catch (error) {
    console.error("Delete Related Product Error:", error)
    return { success: false, error: "Failed to delete related product" }
  }
}
