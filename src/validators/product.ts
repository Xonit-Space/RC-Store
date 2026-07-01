import { z } from "zod"
import { ProductGender } from "@prisma/client"

export const ProductFilterSchema = z.object({
  category: z.string().optional(),
  gender: z.nativeEnum(ProductGender).optional(),
  collection: z.string().optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "popular", "rating"]).default("newest"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(12),
})

export const CmsProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  originalPrice: z.coerce.number().positive("Original price must be positive").optional().nullable(),
  gender: z.nativeEnum(ProductGender).default(ProductGender.UNISEX),
  categoryId: z.string().min(1, "Please select a category"),
  brandId: z.string().optional().nullable(),
  brandName: z.string().optional().nullable(),
  scale: z.string().optional().nullable(),
  collectionId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  attributes: z.array(z.object({
    name: z.string().min(1, "Attribute name required"),
    value: z.string().min(1, "Attribute value required"),
  })).default([]),
  features: z.array(z.string()).default([]),
  includedItems: z.array(z.string()).default([]),
  requiredItems: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
})

export const CmsProductVariantSchema = z.object({
  size: z.string().optional().nullable().default("N/A"),
  color: z.string().optional().nullable().default("N/A"),
  colorName: z.string().optional().nullable().default("N/A"),
  sku: z.string().min(4, "SKU reference code required"),
  price: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  location: z.string().optional().nullable(),
})

export const ReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().min(5, "Comment must be at least 5 characters long").optional().nullable(),
})
