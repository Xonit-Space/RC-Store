import { db } from "@/lib/db"

export class ProductService {
  static async createProduct(adminId: string, data: any) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    return db.$transaction(async (tx) => {
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
            create: data.attributes?.map((attr: any) => ({
              name: attr.name,
              value: attr.value,
            })),
          },
          features: data.features || [],
          includedItems: data.includedItems || [],
          requiredItems: data.requiredItems || [],
          notes: data.notes || null,
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
  }

  static async updateProduct(adminId: string, productId: string, data: any) {
    return db.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          gender: data.gender,
          categoryId: data.categoryId,
          brandId: data.brandId,
          collectionId: data.collectionId,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          features: data.features || [],
          includedItems: data.includedItems || [],
          requiredItems: data.requiredItems || [],
          notes: data.notes || null,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "PRODUCT_UPDATE",
          entity: "Product",
          entityId: p.id,
          changes: JSON.stringify(data),
        },
      })

      return p
    })
  }

  static async softDeleteProduct(adminId: string, productId: string) {
    return db.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id: productId },
        data: { deletedAt: new Date() },
      })

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "PRODUCT_DELETE_SOFT",
          entity: "Product",
          entityId: productId,
        },
      })
      return p
    })
  }

  static async addVariant(adminId: string, productId: string, data: any) {
    return db.$transaction(async (tx) => {
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
  }

  static async updateVariant(adminId: string, variantId: string, data: any) {
    return db.$transaction(async (tx) => {
      const v = await tx.productVariant.update({
        where: { id: variantId },
        data: {
          sku: data.sku,
          size: data.size,
          color: data.color,
          colorName: data.colorName,
          price: data.price,
        },
      })

      // Update inventory if stock/location provided
      if (data.stock !== undefined) {
        const inventory = await tx.inventory.findFirst({
          where: { variantId }
        })
        if (inventory) {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { 
              quantity: data.stock,
              location: data.location
            }
          })
        } else {
          await tx.inventory.create({
            data: {
              variantId,
              quantity: data.stock,
              location: data.location || ""
            }
          })
        }
      }

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "VARIANT_UPDATE",
          entity: "ProductVariant",
          entityId: v.id,
          changes: JSON.stringify(data),
        },
      })

      return v
    })
  }
}
