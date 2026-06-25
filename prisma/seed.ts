/**
 * Aussie Rigs Arena — MASSIVE Comprehensive RC Cars & Racing Experience Seed Script
 * Generates an exhaustive relational dataset across all tables for RC Cars.
 */

import { PrismaClient, ProductGender, OrderStatus, PaymentStatus, ReturnStatus, RefundStatus, SubscriberStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const IMAGES = {
  electric: [
    "https://images.unsplash.com/photo-1596484552993-80a56f08fb76?w=800&q=80",
    "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=80",
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=80",
  ],
  nitro: [
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
  ],
  offroad: [
    "https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?w=800&q=80",
    "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80",
  ],
  drift: [
    "https://images.unsplash.com/photo-1611821064430-0d40221e4c98?w=800&q=80",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80",
  ],
  parts: [
    "https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?w=800&q=80",
    "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800&q=80",
  ],
  batteries: [
    "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=80",
  ]
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

async function main() {
  console.log("🏎️  Aussie Rigs Arena — COMPREHENSIVE RC Cars Database Seed Starting...")

  // 1. DELETE EVERYTHING
  console.log("🗑️  Clearing existing data...")
  const tables = [
    "StaffPick", "GalleryImage", "InventoryMovement", "InventoryReservation", "Inventory", "CartItem", "Cart", 
    "WishlistItem", "Wishlist", "OrderItem", "Payment", "Shipment", "ReturnRequest", 
    "Refund", "Order", "ReviewImage", "Review", "ProductQuestion", "ProductAnswer", 
    "RecentlyViewed", "ProductView", "RecommendationEvent", "SearchHistory", 
    "AbandonedCart", "ProductAttribute", "ProductImage", "ProductVariant", 
    "FlashSale", "Product", "Collection", "Brand", "Category", "Warehouse", 
    "LoyaltyTransaction", "LoyaltyPoint", "StoreCredit", "GiftCard", 
    "EmailSubscriber", "Coupon", "MarketingCampaign", "HeroBanner", "FAQ", 
    "NavigationMenu", "BlogPost", "BlogCategory", "BlogTag", "CMSPage", 
    "Notification", "AuditLog", "SessionLog", "DeviceFingerprint", "Address", 
    "Courier", "User"
  ]
  for (const table of tables) {
    if ((prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)]) {
      await (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany()
    }
  }

  // 2. CORE SETUP (Users, Warehouse, Couriers)
  const warehouse = await prisma.warehouse.create({ data: { name: "Global RC Pits", location: "UK" } })
  const courier = await prisma.courier.create({ data: { name: "Nitro Express" } })

  const pass = await bcrypt.hash("rcadmin123", 12)
  const users = await Promise.all([
    prisma.user.create({ data: { email: "admin@rc.com", passwordHash: pass, role: "SUPER_ADMIN", name: "RC Admin" } }),
    prisma.user.create({ data: { email: "racer@rc.com", passwordHash: pass, role: "CUSTOMER", name: "Pro Racer" } }),
    prisma.user.create({ data: { email: "drifter@rc.com", passwordHash: pass, role: "CUSTOMER", name: "Drift King" } }),
    prisma.user.create({ data: { email: "basher@rc.com", passwordHash: pass, role: "CUSTOMER", name: "Basher Bob" } }),
    prisma.user.create({ data: { email: "crawler@rc.com", passwordHash: pass, role: "CUSTOMER", name: "Trail Master" } })
  ])

  // 3. CATALOG HIERARCHY
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: "Traxxion", slug: "traxxion", description: "Fastest in RC" } }),
    prisma.brand.create({ data: { name: "Armour RC", slug: "armour-rc", description: "Tough bashers" } }),
    prisma.brand.create({ data: { name: "Yokodrift", slug: "yokodrift", description: "Drift legends" } }),
    prisma.brand.create({ data: { name: "HobbyPower", slug: "hobbypower", description: "Batteries" } }),
    prisma.brand.create({ data: { name: "Spektrum", slug: "spektrum", description: "Radios" } })
  ])

  const cats = await Promise.all([
    prisma.category.create({ data: { name: "Cars & Trucks", slug: "cars-trucks" } }),
    prisma.category.create({ data: { name: "Parts", slug: "parts" } }),
    prisma.category.create({ data: { name: "Electronics", slug: "electronics" } })
  ])

  const subCats = await Promise.all([
    prisma.category.create({ data: { name: "Electric Cars", slug: "electric", parentId: cats[0].id } }),
    prisma.category.create({ data: { name: "Nitro Cars", slug: "nitro", parentId: cats[0].id } }),
    prisma.category.create({ data: { name: "Crawlers", slug: "crawlers", parentId: cats[0].id } }),
    prisma.category.create({ data: { name: "Drift", slug: "drift", parentId: cats[0].id } }),
    prisma.category.create({ data: { name: "Transmitters", slug: "transmitters", parentId: cats[2].id } }),
    prisma.category.create({ data: { name: "Batteries", slug: "batteries", parentId: cats[2].id } }),
    prisma.category.create({ data: { name: "Suspension", slug: "suspension", parentId: cats[1].id } })
  ])

  const colls = await Promise.all([
    prisma.collection.create({ data: { name: "Pro Racing", slug: "pro-racing" } }),
    prisma.collection.create({ data: { name: "Bashers", slug: "bashers" } }),
    prisma.collection.create({ data: { name: "Scale Realism", slug: "scale" } })
  ])

  // 4. GENERATE 50+ PRODUCTS WITH FULL RELATIONS
  console.log("Generating products...")
  const allProducts = []
  
  for (let i = 1; i <= 60; i++) {
    const isCar = i <= 40
    let type = isCar ? pick(["Electric Cars", "Nitro Cars", "Crawlers", "Drift"]) : pick(["Transmitters", "Batteries", "Suspension"])
    const category = subCats.find(c => c.name === type) || subCats[0]
    
    let baseImg = IMAGES.electric[0]
    if (type === "Nitro Cars") baseImg = IMAGES.nitro[0]
    if (type === "Crawlers") baseImg = IMAGES.offroad[0]
    if (type === "Drift") baseImg = IMAGES.drift[0]
    if (type === "Batteries") baseImg = IMAGES.batteries[0]
    if (type === "Transmitters" || type === "Suspension") baseImg = IMAGES.parts[0]

    const brand = brands[rand(0, brands.length - 1)]
    const collection = (i % 3 === 0) ? colls[rand(0, colls.length - 1)] : null
    const price = isCar ? rand(200, 1000) : rand(20, 200)

    const p = await prisma.product.create({
      data: {
        name: `${brand.name} ${type.replace("Cars", "").replace("s", "")} Model ${i}X`,
        slug: slugify(`${brand.name} ${type} ${i}x`),
        description: `High performance ${type} from ${brand.name}. Engineered for extreme conditions and max power.`,
        price: price,
        originalPrice: i % 5 === 0 ? price + rand(20, 100) : null,
        isActive: true,
        isFeatured: i <= 8,
        isNewRelease: i > 55,
        brandId: brand.id,
        categoryId: category.id,
        collectionId: collection?.id,
        images: {
          create: [
            { url: baseImg, alt: `View 1`, isFeatured: true, sortOrder: 1 },
            { url: baseImg, alt: `View 2`, sortOrder: 2 }
          ]
        },
        attributes: {
          create: [
            { name: "Top Speed", value: `${rand(20, 80)} MPH` },
            { name: "Scale", value: isCar ? pick(["1/8", "1/10", "1/18"]) : "N/A" },
            { name: "Drive", value: pick(["2WD", "4WD", "6WD"]) }
          ]
        },
        variants: {
          create: [
            { sku: `SKU-${i}-A`, size: "Standard", color: "Red", isActive: true },
            { sku: `SKU-${i}-B`, size: "Standard", color: "Blue", isActive: true }
          ]
        }
      },
      include: { variants: true }
    })
    allProducts.push(p)

    // INVENTORY
    for (const v of p.variants) {
      await prisma.inventory.create({
        data: { variantId: v.id, warehouseId: warehouse.id, quantity: rand(10, 100), location: `A${rand(1, 10)}` }
      })
    }
    
    // REVIEWS (2 per product, always from different users to avoid unique constraint)
    if (i % 2 === 0) {
      const reviewers = [users[1], users[2], users[3], users[4]]
      const r1 = reviewers[i % reviewers.length]
      const r2 = reviewers[(i + 1) % reviewers.length]
      for (const reviewer of [r1, r2]) {
        await prisma.review.create({
          data: {
            productId: p.id,
            userId: reviewer.id,
            rating: rand(4, 5),
            comment: pick(["Insane speed!", "Broke an arm on first jump, but otherwise great.", "Best drift chassis ever.", "Battery lasts forever."])
          }
        })
      }
    }

    // QUESTIONS
    if (i % 5 === 0) {
      const q = await prisma.productQuestion.create({
        data: { productId: p.id, userId: users[1].id, questionText: "Does this include a battery and charger?" }
      })
      await prisma.productAnswer.create({
        data: { questionId: q.id, userId: users[0].id, answerText: "Yes, this is an RTR (Ready-to-Run) kit." }
      })
    }
  }

  // 5. FLASH SALES & COUPONS
  await prisma.flashSale.create({
    data: {
      name: "Weekend Bash Sale", discountPercent: 20, startDate: new Date(), endDate: new Date(Date.now() + 86400000 * 2),
      products: { connect: [{ id: allProducts[0].id }, { id: allProducts[1].id }] }
    }
  })
  const coupon = await prisma.coupon.create({
    data: { code: "RCFAN20", discountType: "PERCENTAGE", discountValue: 20, startDate: new Date(), endDate: new Date(Date.now() + 86400000 * 30) }
  })
  
  // 6. COMPLEX RELATIONAL ORDERS (Cart, Order, Payments, Shipment, Loyalty)
  console.log("Generating relational orders...")
  for (let i = 0; i < 15; i++) {
    const user = users[rand(1, users.length - 1)]
    const addr = await prisma.address.create({
      data: { userId: user.id, title: "Home", line1: "123 Nitro St", city: "Speedville", state: "TX", postalCode: "75000", country: "US", phone: "555-0000" }
    })
    
    const p1 = allProducts[rand(0, allProducts.length - 1)]
    const v1 = p1.variants[0]
    
    // Order
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-${i}`,
        userId: user.id,
        status: "DELIVERED",
        subtotal: Number(p1.price),
        tax: Number(p1.price) * 0.1,
        shippingCost: 15,
        total: Number(p1.price) * 1.1 + 15,
        shippingAddressId: addr.id,
        billingAddressId: addr.id,
        items: { create: [{ variantId: v1.id, quantity: 1, price: p1.price, total: p1.price }] }
      }
    })
    
    // Payment & Shipment
    await prisma.payment.create({ data: { orderId: order.id, transactionId: `TX-${Date.now()}-${i}`, amount: order.total, status: "COMPLETED" } })
    await prisma.shipment.create({ data: { orderId: order.id, trackingNumber: `TRK-${Date.now()}-${i}`, carrier: "Nitro Express", status: "DELIVERED" } })

    // Loyalty Points (Upsert pattern to prevent duplicates)
    await prisma.loyaltyPoint.upsert({
      where: { userId: user.id },
      update: { pointsBalance: { increment: Math.floor(Number(order.total)) } },
      create: { userId: user.id, pointsBalance: Math.floor(Number(order.total)) }
    })
  }

  // 7. BLOG & CMS
  const bCat = await prisma.blogCategory.create({ data: { name: "Tech Tips", slug: "tech-tips" } })
  const bTag = await prisma.blogTag.create({ data: { name: "LiPo", slug: "lipo" } })
  await prisma.blogPost.create({
    data: {
      title: "How to properly balance charge your LiPo batteries",
      slug: "lipo-charging-guide",
      content: "Always use a balance charger for multi-cell LiPo batteries to prevent fire hazards...",
      published: true, authorId: users[0].id, categoryId: bCat.id, tags: { connect: [{ id: bTag.id }] }
    }
  })

  // 8. FAQS
  await prisma.fAQ.createMany({
    data: [
      { category: "Shipping", question: "Do you ship LiPo batteries internationally?", answer: "Due to aviation regulations, we can only ship LiPo batteries via ground transport to domestic addresses." },
      { category: "Technical", question: "What is the difference between brushed and brushless?", answer: "Brushless motors are vastly more efficient, run cooler, and provide significantly higher top speeds and torque." }
    ]
  })

  // 9. LANDING PAGE SECTIONS (Staff Picks & Gallery)
  console.log("Generating landing page sections...")
  await prisma.staffPick.createMany({
    data: [
      { productId: allProducts[0].id, userId: users[1].id, roleTitle: "Lead Technician", quote: "Absolute beast on the track.", sortOrder: 1 },
      { productId: allProducts[2].id, userId: users[2].id, roleTitle: "Drift Specialist", quote: "Slides like butter.", sortOrder: 2 },
      { productId: allProducts[4].id, userId: users[3].id, roleTitle: "Basher Pro", quote: "Toughest truck I've ever driven.", sortOrder: 3 },
      { productId: allProducts[6].id, userId: users[4].id, roleTitle: "Crawler Expert", quote: "Unstoppable on the rocks.", sortOrder: 4 },
    ]
  })

  await prisma.galleryImage.createMany({
    data: [
      { imageUrl: IMAGES.electric[0], caption: "Track day fun!", authorName: "@rc_racer_1", productId: allProducts[0].id, isApproved: true, sortOrder: 1 },
      { imageUrl: IMAGES.nitro[0], caption: "Nitro smoke!", authorName: "@nitro_king", productId: allProducts[1].id, isApproved: true, sortOrder: 2 },
      { imageUrl: IMAGES.offroad[0], caption: "Rock crawling.", authorName: "@trail_boss", productId: allProducts[2].id, isApproved: true, sortOrder: 3 },
      { imageUrl: IMAGES.drift[0], caption: "Sideways action.", authorName: "@drift_legend", productId: allProducts[3].id, isApproved: true, sortOrder: 4 },
      { imageUrl: IMAGES.electric[1], caption: "Jumping over cars.", authorName: "@bash_master", productId: allProducts[4].id, isApproved: true, sortOrder: 5 },
    ]
  })

  // 10. HERO BANNERS
  await prisma.heroBanner.create({ data: { title: "Track Ready", subtitle: "Competition chassis", image: IMAGES.electric[0], link: "/products" } })

  console.log("\n🎉 ════════════════════════════════════════════════")
  console.log("   Aussie Rigs Arena COMPREHENSIVE RC Cars seed complete!")
  console.log("   ════════════════════════════════════════════════\n")
}

main().catch(console.error).finally(() => prisma.$disconnect())
