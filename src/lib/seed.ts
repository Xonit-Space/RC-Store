import { PrismaClient, UserRole, ProductGender } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seeding script...")

  // 1. Clean existing records to prevent uniqueness violations
  console.log("🗑️ Purging existing records...")
  await db.auditLog.deleteMany()
  await db.notification.deleteMany()
  await db.recentlyViewed.deleteMany()
  await db.reviewImage.deleteMany()
  await db.review.deleteMany()
  await db.orderItem.deleteMany()
  await db.payment.deleteMany()
  await db.shipment.deleteMany()
  await db.order.deleteMany()
  await db.coupon.deleteMany()
  await db.cartItem.deleteMany()
  await db.cart.deleteMany()
  await db.wishlistItem.deleteMany()
  await db.wishlist.deleteMany()
  await db.inventory.deleteMany()
  await db.productVariant.deleteMany()
  await db.productImage.deleteMany()
  await db.productAttribute.deleteMany()
  await db.product.deleteMany()
  await db.category.deleteMany()
  await db.brand.deleteMany()
  await db.collection.deleteMany()
  await db.address.deleteMany()
  await db.user.deleteMany()

  // 2. Hash passwords for accounts
  console.log("🔑 Generating passwords hashes...")
  const passwordHash = await bcrypt.hash("neoshop_secure_password_2026", 12)

  // 3. Create role accounts
  console.log("👤 Provisioning user roles...")
  const superAdmin = await db.user.create({
    data: {
      email: "superadmin@neoshop.com",
      passwordHash,
      name: "Victoria Sterling",
      role: UserRole.SUPER_ADMIN,
    },
  })

  const admin = await db.user.create({
    data: {
      email: "admin@neoshop.com",
      passwordHash,
      name: "Marcus Vance",
      role: UserRole.ADMIN,
    },
  })

  const customer = await db.user.create({
    data: {
      email: "demo@neoshop.com",
      passwordHash,
      name: "Ethan Cross",
      role: UserRole.CUSTOMER,
    },
  })

  // 4. Create addresses
  console.log("📍 Seeding customer addresses...")
  const shippingAddress = await db.address.create({
    data: {
      userId: customer.id,
      title: "Penthouse Apartment",
      line1: "55 Mercer St",
      line2: "Apt 24B",
      city: "New York",
      state: "NY",
      postalCode: "10013",
      country: "US",
      phone: "+12125550198",
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
  })

  // 5. Create brands & collections
  console.log("🏷️ Seeding brands and seasonal collections...")
  const urbanEdge = await db.brand.create({
    data: {
      name: "Urban Edge",
      slug: "urban-edge",
      description: "Contemporary streetwear tailored for luxury minimalism.",
      logo: "/placeholder.svg?height=100&width=100",
    },
  })

  const summerColl = await db.collection.create({
    data: {
      name: "Summer Linen 2026",
      slug: "summer-linen-2026",
      description: "Airy fabrics, relaxed drops, and earth tones.",
      image: "/placeholder.svg?height=600&width=800",
    },
  })

  // 6. Create categories tree
  console.log("📁 Seeding departments category trees...")
  const men = await db.category.create({
    data: {
      name: "Men",
      slug: "men",
      description: "Men's premium apparel and accessories.",
    },
  })

  const menApparel = await db.category.create({
    data: {
      name: "Apparel",
      slug: "men-apparel",
      parentId: men.id,
    },
  })

  const menStreetwear = await db.category.create({
    data: {
      name: "Streetwear",
      slug: "men-streetwear",
      parentId: menApparel.id,
    },
  })

  // 7. Create Coupons
  console.log("🎟️ Seeding promotional coupons...")
  await db.coupon.create({
    data: {
      code: "NEOSHOP20",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minOrderAmount: 100,
      maxDiscountAmount: 50,
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Active yesterday
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days duration
      usageLimit: 500,
      isActive: true,
    },
  })

  // 8. Create dynamic fashion products
  console.log("👕 Seeding designer streetwear garments...")
  const products = [
    {
      name: "Oversized Utility Cargo Bomber",
      slug: "oversized-utility-cargo-bomber",
      description: "A premium nylon streetwear bomber jacket featuring functional modular cargo pockets, dropped shoulder seams, and water-repellent zippers.",
      price: 245.0,
      originalPrice: 295.0,
      gender: ProductGender.UNISEX,
      categoryId: menStreetwear.id,
      brandId: urbanEdge.id,
      collectionId: summerColl.id,
      isFeatured: true,
      images: [
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600",
      ],
      attributes: [
        { name: "Fit", value: "Relaxed Oversized Drop" },
        { name: "Material", value: "100% Water-Resistant Nylon" },
        { name: "Care", value: "Dry Clean Only" },
        { name: "Origin", value: "Crafted in Tokyo" },
      ],
      variants: [
        { size: "S", color: "#000000", colorName: "Midnight Obsidian", stock: 15, sku: "OB-BOMBER-S" },
        { size: "M", color: "#000000", colorName: "Midnight Obsidian", stock: 30, sku: "OB-BOMBER-M" },
        { size: "L", color: "#000000", colorName: "Midnight Obsidian", stock: 25, sku: "OB-BOMBER-L" },
        { size: "XL", color: "#000000", colorName: "Midnight Obsidian", stock: 10, sku: "OB-BOMBER-XL" },
        { size: "M", color: "#556b2f", colorName: "Sage Olive", stock: 20, sku: "OL-BOMBER-M" },
        { size: "L", color: "#556b2f", colorName: "Sage Olive", stock: 15, sku: "OL-BOMBER-L" },
      ],
    },
    {
      name: "Pleated Relaxed Linen Trouser",
      slug: "pleated-relaxed-linen-trouser",
      description: "Breathe easy in these tailored trousers cut from organic, lightweight linen. Features dual back welt pockets, elastic drawcord, and subtle front pleats.",
      price: 165.0,
      gender: ProductGender.MEN,
      categoryId: menApparel.id,
      brandId: urbanEdge.id,
      collectionId: summerColl.id,
      isFeatured: true,
      images: [
        "/placeholder.svg?height=600&width=600",
      ],
      attributes: [
        { name: "Fit", value: "Tapered Pleated Relaxed" },
        { name: "Material", value: "100% Organic Linen" },
        { name: "Care", value: "Cold Hand Wash" },
      ],
      variants: [
        { size: "S", color: "#f5f5dc", colorName: "Raw Ecru", stock: 12, sku: "RE-LN-TRSR-S" },
        { size: "M", color: "#f5f5dc", colorName: "Raw Ecru", stock: 18, sku: "RE-LN-TRSR-M" },
        { size: "L", color: "#f5f5dc", colorName: "Raw Ecru", stock: 15, sku: "RE-LN-TRSR-L" },
        { size: "M", color: "#000000", colorName: "Midnight Obsidian", stock: 10, sku: "OB-LN-TRSR-M" },
      ],
    },
  ]

  for (const item of products) {
    const product = await db.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        originalPrice: item.originalPrice,
        gender: item.gender,
        categoryId: item.categoryId,
        brandId: item.brandId,
        collectionId: item.collectionId,
        isFeatured: item.isFeatured,
        images: {
          create: item.images.map((url, index) => ({
            url,
            isFeatured: index === 0,
            sortOrder: index,
          })),
        },
        attributes: {
          create: item.attributes,
        },
      },
    })

    // Seed variants and link dynamic inventory slots
    for (const v of item.variants) {
      const variant = await db.productVariant.create({
        data: {
          productId: product.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          colorName: v.colorName,
          inventory: {
            create: {
              quantity: v.stock,
              reserved: 0,
              location: "Warehouse-A5-Bin12",
            },
          },
        },
      })
    }

    // Seed customer review ratings
    await db.review.create({
      data: {
        productId: product.id,
        userId: customer.id,
        rating: 5,
        comment: `Incredible fit and premium fabric quality. The ${product.name} surpassed all my expectations! Highly recommend.`,
      },
    })
  }

  // 9. Setup Global Site Settings
  console.log("⚙️ Seeding default site configurations...")
  await db.siteSetting.create({
    data: {
      key: "store_status_open",
      value: "true",
      description: "Toggles public storefront checkout access.",
    },
  })

  await db.siteSetting.create({
    data: {
      key: "free_shipping_threshold",
      value: "150.0",
      description: "Minimum cart total required to waive domestic shipping costs.",
    },
  })

  // 10. Provision empty shopping structures for our Demo Customer
  await Promise.all([
    db.cart.create({ data: { userId: customer.id } }),
    db.wishlist.create({ data: { userId: customer.id } }),
  ])

  console.log("✅ Database seeded with premium fashion data successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seeding script encountered critical failure:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
