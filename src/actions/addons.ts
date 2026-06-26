"use server"

import { db } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { ActionResponse } from "./auth"
import { Prisma } from "@prisma/client"

const AddonSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  price: z.number().min(0, "Price must be non-negative"),
  isActive: z.boolean().default(true),
})

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function getAddons() {
  return db.addon.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAddon(id: string) {
  return db.addon.findUnique({
    where: { id }
  })
}

export async function createAddon(data: z.infer<typeof AddonSchema>): Promise<ActionResponse> {
  const parsed = AddonSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { name, description, image, price, isActive } = parsed.data
  const slug = parsed.data.slug || slugify(name)

  try {
    const existing = await db.addon.findUnique({ where: { slug } })
    if (existing) {
      return { success: false, error: "An addon with this slug already exists." }
    }

    await db.addon.create({
      data: {
        name,
        slug,
        description,
        image,
        price,
        isActive
      }
    })

    revalidatePath("/admin/addons")
    return { success: true }
  } catch (error: any) {
    console.error("Create Addon Error:", error)
    return { success: false, error: "Failed to create addon." }
  }
}

export async function updateAddon(id: string, data: z.infer<typeof AddonSchema>): Promise<ActionResponse> {
  const parsed = AddonSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { name, slug, description, image, price, isActive } = parsed.data

  try {
    const existing = await db.addon.findUnique({ where: { slug } })
    if (existing && existing.id !== id) {
      return { success: false, error: "An addon with this slug already exists." }
    }

    await db.addon.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        price,
        isActive
      }
    })

    revalidatePath("/admin/addons")
    return { success: true }
  } catch (error: any) {
    console.error("Update Addon Error:", error)
    return { success: false, error: "Failed to update addon." }
  }
}

export async function deleteAddon(id: string): Promise<ActionResponse> {
  try {
    await db.addon.delete({
      where: { id }
    })

    revalidatePath("/admin/addons")
    return { success: true }
  } catch (error: any) {
    console.error("Delete Addon Error:", error)
    return { success: false, error: "Failed to delete addon." }
  }
}

export async function getProductAddons(productId: string) {
  const productAddons = await db.productAddon.findMany({
    where: { productId },
    include: { addon: true }
  })
  return productAddons.map(pa => pa.addon)
}

export async function assignAddonsToProduct(productId: string, addonIds: string[]): Promise<ActionResponse> {
  try {
    // Current assignments
    const existing = await db.productAddon.findMany({ where: { productId } })
    const existingIds = existing.map(e => e.addonId)

    const toAdd = addonIds.filter(id => !existingIds.includes(id))
    const toRemove = existingIds.filter(id => !addonIds.includes(id))

    if (toRemove.length > 0) {
      await db.productAddon.deleteMany({
        where: {
          productId,
          addonId: { in: toRemove }
        }
      })
    }

    if (toAdd.length > 0) {
      await db.productAddon.createMany({
        data: toAdd.map(addonId => ({ productId, addonId }))
      })
    }

    revalidatePath(`/admin/products/${productId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Assign Addons Error:", error)
    return { success: false, error: "Failed to assign addons to product." }
  }
}
