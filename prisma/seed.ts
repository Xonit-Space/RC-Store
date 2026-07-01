import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🏎️  Aussie Rigs Arena — Database Clearing & Initial Seed Starting...")

  // 1. DELETE EVERYTHING
  console.log("🗑️  Clearing existing data...")
  const tables = [
    "StaffPick", "GalleryImage", "InventoryMovement", "InventoryReservation", "Inventory", "CartItem", "Cart", 
    "WishlistItem", "Wishlist", "OrderItem", "Payment", "Shipment", "ReturnRequest", 
    "Refund", "Order", "ReviewImage", "Review", "ProductAnswer", "ProductQuestion", 
    "ProductVideo", "ProductDocument", "ProductFeatureBlock", "RelatedProduct",
    "RecentlyViewed", "ProductView", "RecommendationEvent", "SearchHistory", 
    "AbandonedCart", "ProductAttribute", "ProductImage", "ProductVariant", 
    "FlashSale", "Product", "Collection", "Brand", "Category", "Warehouse", 
    "LoyaltyTransaction", "LoyaltyPoint", "StoreCredit", "GiftCard", 
    "EmailSubscriber", "Coupon", "MarketingCampaign", "HeroBanner", "FAQ", 
    "NavigationMenu", "BlogPost", "BlogCategory", "BlogTag", "CMSPage", 
    "Notification", "AuditLog", "SessionLog", "DeviceFingerprint", "Address", 
    "Courier", "User", "SiteSetting"
  ]
  for (const table of tables) {
    if ((prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)]) {
      await (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany()
    }
  }

  console.log("👤  Seeding Users...")
  const pass = await bcrypt.hash("rcadmin123", 12)
  const users = await Promise.all([
    prisma.user.create({ data: { email: "admin@rc.com", passwordHash: pass, role: "SUPER_ADMIN", name: "RC Admin" } }),
    prisma.user.create({ data: { email: "racer@rc.com", passwordHash: pass, role: "CUSTOMER", name: "Pro Racer" } }),
    prisma.user.create({ data: { email: "drifter@rc.com", passwordHash: pass, role: "CUSTOMER", name: "Drift King" } }),
    prisma.user.create({ data: { email: "basher@rc.com", passwordHash: pass, role: "CUSTOMER", name: "Basher Bob" } }),
    prisma.user.create({ data: { email: "crawler@rc.com", passwordHash: pass, role: "CUSTOMER", name: "Trail Master" } })
  ])

  console.log("\n🎉 ════════════════════════════════════════════════")
  console.log("   Database cleared and Users seeded successfully!")
  console.log("   ════════════════════════════════════════════════\n")
}

main().catch(console.error).finally(() => prisma.$disconnect())
