"use"

import { db } from "@/lib/db"
import { ReviewSchema, CmsProductSchema, CmsProductVariantSchema } from "@/validators/product"
import { createProductReview } from "@/repositories/product"
import { ActionResponse } from "./auth"

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
  const result = CmsProductSchema.safeParse(formData)

  if (!result.success) {
    const errorMsg = result.error.errors.map((e) => e.message).join(", ")
    return { success: false, error: errorMsg }
  }

  const data = result.data
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")

  try {
    const product = await db.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          gender: data.gender,
          categoryId: data.categoryId,
          brandId: data.brandId,
          collectionId: data.collectionId,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          attributes: {
            create: data.attributes.map((attr) => ({
              name: attr.name,
              value: attr.value,
            })),
          },
        },
      })

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "PRODUCT_CREATE",
          entity: "Product",
          entityId: p.id,
          changes: JSON.stringify(data),
        },
      })

      return p
    })

    return { success: true, data: product }
  } catch (error) {
    console.error("CMS Product Create Action Error:", error)
    return { success: false, error: "Failed to create catalog product" }
  }
}

export async function adminAddVariant(
  adminId: string,
  productId: string,
  variantData: any
): Promise<ActionResponse> {
  const result = CmsProductVariantSchema.safeParse(variantData)

  if (!result.success) {
    const errorMsg = result.error.errors.map((e) => e.message).join(", ")
    return { success: false, error: errorMsg }
  }

  const data = result.data

  try {
    const variant = await db.$transaction(async (tx) => {
      const v = await tx.productVariant.create({
        data: {
          productId,
          sku: data.sku,
          size: data.size,
          color: data.color,
          colorName: data.colorName,
          price: data.price,
          inventory: {
            create: {
              quantity: data.stock,
              location: data.location,
            },
          },
        },
      })

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "VARIANT_ADD",
          entity: "ProductVariant",
          entityId: v.id,
          changes: JSON.stringify(data),
        },
      })

      return v
    })

    return { success: true, data: variant }
  } catch (error) {
    console.error("CMS Variant Create Action Error:", error)
    return { success: false, error: "Failed to create SKU variant" }
  }
}
