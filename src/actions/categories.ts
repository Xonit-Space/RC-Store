"use server"

import { db } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { ActionResponse } from "./auth"

const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  parentId: z.string().optional().nullable(),
})

export async function getCategories() {
  return db.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      parent: true,
      _count: {
        select: { products: true, children: true }
      }
    }
  })
}

export async function getCategory(id: string) {
  return db.category.findUnique({
    where: { id }
  })
}

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function createCategory(data: z.infer<typeof CategorySchema>): Promise<ActionResponse> {
  const parsed = CategorySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { name, description, image, isActive, sortOrder, parentId } = parsed.data
  let slug = parsed.data.slug || slugify(name)

  try {
    const existing = await db.category.findUnique({ where: { slug } })
    if (existing) {
      return { success: false, error: "A category with this slug already exists." }
    }

    await db.category.create({
      data: {
        name,
        slug,
        description,
        image,
        isActive,
        sortOrder,
        parentId: parentId || null
      }
    })

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    console.error("Create Category Error:", error)
    return { success: false, error: "Failed to create category." }
  }
}

export async function updateCategory(id: string, data: z.infer<typeof CategorySchema>): Promise<ActionResponse> {
  const parsed = CategorySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { name, slug, description, image, isActive, sortOrder, parentId } = parsed.data

  try {
    const existing = await db.category.findUnique({ where: { slug } })
    if (existing && existing.id !== id) {
      return { success: false, error: "A category with this slug already exists." }
    }

    await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        isActive,
        sortOrder,
        parentId: parentId || null
      }
    })

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    console.error("Update Category Error:", error)
    return { success: false, error: "Failed to update category." }
  }
}

export async function deleteCategory(id: string): Promise<ActionResponse> {
  try {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, children: true }
        }
      }
    })

    if (!category) {
      return { success: false, error: "Category not found." }
    }

    if (category._count.products > 0) {
      return { success: false, error: "Cannot delete category because it has products assigned to it." }
    }
    
    if (category._count.children > 0) {
      return { success: false, error: "Cannot delete category because it has sub-categories." }
    }

    await db.category.delete({
      where: { id }
    })

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    console.error("Delete Category Error:", error)
    return { success: false, error: "Failed to delete category." }
  }
}

export async function toggleCategoryStatus(id: string, isActive: boolean): Promise<ActionResponse> {
  try {
    await db.category.update({
      where: { id },
      data: { isActive }
    })
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update status." }
  }
}
