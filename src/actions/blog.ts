"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getBlogPosts() {
  try {
    const posts = await db.blogPost.findMany({
      include: {
        author: { select: { name: true } },
        category: true,
      },
      orderBy: { createdAt: "desc" }
    })
    return { success: true, data: posts }
  } catch (error: any) {
    console.error("Failed to fetch blog posts:", error)
    return { success: false, error: "Failed to load blog posts" }
  }
}

export async function getPublishedBlogPosts() {
  try {
    const posts = await db.blogPost.findMany({
      where: { published: true },
      include: {
        author: { select: { name: true, avatar: true } },
        category: true,
      },
      orderBy: { publishedAt: "desc" }
    })
    return { success: true, data: posts }
  } catch (error: any) {
    console.error("Failed to fetch published blog posts:", error)
    return { success: false, error: "Failed to load blog posts" }
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, avatar: true } },
        category: true,
      }
    })
    if (!post) return { success: false, error: "Post not found" }
    return { success: true, data: post }
  } catch (error: any) {
    console.error("Failed to fetch blog post:", error)
    return { success: false, error: "Failed to load blog post" }
  }
}

export async function createBlogPost(data: {
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  published?: boolean
  categoryId: string
  authorId?: string
}) {
  try {
    const post = await db.blogPost.create({
      data: {
        ...data,
        publishedAt: data.published ? new Date() : null
      }
    })
    revalidatePath("/blog")
    revalidatePath("/admin/blog")
    return { success: true, data: post }
  } catch (error: any) {
    console.error("Failed to create blog post:", error)
    return { success: false, error: "Failed to create blog post. Check if slug is unique." }
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await db.blogPost.delete({ where: { id } })
    revalidatePath("/blog")
    revalidatePath("/admin/blog")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete blog post:", error)
    return { success: false, error: "Failed to delete blog post" }
  }
}

export async function getBlogCategories() {
  try {
    const categories = await db.blogCategory.findMany({
      orderBy: { name: "asc" }
    })
    return { success: true, data: categories }
  } catch (error: any) {
    console.error("Failed to fetch blog categories:", error)
    return { success: false, error: "Failed to load blog categories" }
  }
}

export async function createBlogCategory(name: string, slug: string) {
  try {
    const category = await db.blogCategory.create({
      data: { name, slug }
    })
    return { success: true, data: category }
  } catch (error: any) {
    console.error("Failed to create blog category:", error)
    return { success: false, error: "Failed to create blog category" }
  }
}
