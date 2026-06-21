import { db } from "@/lib/db"
import { cacheGet, cacheSet } from "./cache"
import { Prisma } from "@prisma/client"

export interface CmsSection {
  type: string // "hero" | "banner-grid" | "featured-products" | "newsletter"
  title?: string
  subtitle?: string
  settings?: Record<string, unknown>
  items?: Array<Record<string, unknown>>
}

export async function getCMSPageBySlug(slug: string) {
  const cacheKey = `cms_page_${slug}`
  const cached = await cacheGet<unknown>(cacheKey)
  if (cached) return cached as NonNullable<Awaited<ReturnType<typeof db.cMSPage.findUnique>>> & { sections: CmsSection[] }

  const page = await db.cMSPage.findUnique({
    where: { slug, published: true },
  })

  if (!page) return null

  const pageData = {
    ...page,
    sections: JSON.parse(page.content) as CmsSection[],
  }

  await cacheSet(cacheKey, pageData, 600) // cache for 10 minutes
  return pageData
}

export interface GetBlogPostsOptions {
  categorySlug?: string
  tagSlug?: string
  search?: string
  page?: number
  limit?: number
}

export async function getBlogPosts(options?: GetBlogPostsOptions) {
  const { categorySlug, tagSlug, search, page = 1, limit = 10 } = options || {}
  const skip = (page - 1) * limit

  const where: Prisma.BlogPostWhereInput = {
    published: true,
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(tagSlug && { tags: { some: { slug: tagSlug } } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ],
    }),
  }

  const [posts, totalCount] = await Promise.all([
    db.blogPost.findMany({
      where,
      include: {
        author: { select: { name: true, avatar: true } },
        category: true,
        tags: true,
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    db.blogPost.count({ where }),
  ])

  return {
    items: posts,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  }
}

export async function getBlogPostBySlug(slug: string) {
  const cacheKey = `blog_post_${slug}`
  const cached = await cacheGet<unknown>(cacheKey)
  if (cached) return cached as NonNullable<Awaited<ReturnType<typeof db.blogPost.findUnique>>>

  const post = await db.blogPost.findUnique({
    where: { slug, published: true },
    include: {
      author: { select: { name: true, avatar: true } },
      category: true,
      tags: true,
    },
  })

  if (!post) return null

  await cacheSet(cacheKey, post, 600)
  return post
}

export async function getNavigationMenu(location: "HEADER" | "FOOTER") {
  const cacheKey = `nav_menu_${location}`
  const cached = await cacheGet<unknown>(cacheKey)
  if (cached) return cached as NonNullable<Awaited<ReturnType<typeof db.navigationMenu.findUnique>>> & { items: unknown[] }

  const menu = await db.navigationMenu.findUnique({
    where: { location },
  })

  if (!menu) return null

  const menuData = {
    ...menu,
    items: JSON.parse(menu.items),
  }

  await cacheSet(cacheKey, menuData, 1800) // cache for 30 minutes
  return menuData
}

export async function getFAQs(category?: string) {
  return db.fAQ.findMany({
    where: {
      ...(category && { category }),
    },
    orderBy: { sortOrder: "asc" },
  })
}
