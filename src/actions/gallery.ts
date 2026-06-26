"use server"

import { db } from "@/lib/db"
import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"

const uploadSchema = z.object({
  imageUrl: z.string().url("Must be a valid URL"),
  caption: z.string().optional(),
  authorName: z.string().optional(),
  productId: z.string().optional().nullable(),
})

export async function uploadGalleryImage(data: z.infer<typeof uploadSchema>) {
  try {
    const validated = uploadSchema.parse(data)
    const newImage = await db.galleryImage.create({
      data: {
        imageUrl: validated.imageUrl,
        caption: validated.caption,
        authorName: validated.authorName,
        productId: validated.productId || undefined,
        isApproved: false // Needs admin approval
      }
    })
    revalidatePath("/admin/gallery")
    return { success: true, data: newImage }
  } catch (error: any) {
    return { success: false, error: error.message || "Upload failed" }
  }
}

export async function getAdminGalleryImages() {
  return await db.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true } } }
  })
}

export async function toggleGalleryImageApproval(id: string, isApproved: boolean) {
  try {
    await db.galleryImage.update({
      where: { id },
      data: { isApproved }
    })
    revalidateTag("gallery")
    revalidatePath("/admin/gallery")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Update failed" }
  }
}

export async function deleteGalleryImage(id: string) {
  try {
    await db.galleryImage.delete({ where: { id } })
    revalidateTag("gallery")
    revalidatePath("/admin/gallery")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Deletion failed" }
  }
}
