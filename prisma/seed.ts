/**
 * NeoShop Ultra — Comprehensive Women's Fashion Seed Script
 * Populates the database with luxury women's fashion data including
 * real Unsplash image URLs, variants, inventory, users, orders, coupons & reviews.
 */

import { PrismaClient, ProductGender, OrderStatus, PaymentStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────────────────────
// CURATED UNSPLASH IMAGE POOLS — Real, working women's fashion photos
// ─────────────────────────────────────────────────────────────────────────────
const IMAGES = {
  dresses: [
    "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&q=80",
    "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
  ],
  tops: [
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
    "https://images.unsplash.com/photo-1611911813383-67769b37a149?w=800&q=80",
    "https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=800&q=80",
    "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80",
    "https://images.unsplash.com/photo-1602810319428-019690571b5b?w=800&q=80",
    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80",
    "https://images.unsplash.com/photo-1562572159-4efd90232c32?w=800&q=80",
  ],
  pants: [
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
    "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800&q=80",
    "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&q=80",
    "https://images.unsplash.com/photo-1594938298603-c8148c4b4e6a?w=800&q=80",
    "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800&q=80",
    "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80",
  ],
  outerwear: [
    "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80",
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80",
    "https://images.unsplash.com/photo-1544441892-794166f1e3be?w=800&q=80",
    "https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=800&q=80",
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
    "https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800&q=80",
  ],
  bags: [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    "https://images.unsplash.com/photo-1592503254549-d83d24a4dfab?w=800&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
    "https://images.unsplash.com/photo-1594938298603-c8148c4b4e6a?w=800&q=80",
  ],
  shoes: [
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&q=80",
    "https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=800&q=80",
    "https://images.unsplash.com/photo-1510130143595-caaddb5f3d29?w=800&q=80",
    "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=800&q=80",
    "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=800&q=80",
  ],
  jewelry: [
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
    "https://images.unsplash.com/photo-1573408301185-9519f94815b5?w=800&q=80",
    "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80",
    "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80",
  ],
  skirts: [
    "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
    "https://images.unsplash.com/photo-1561388510-cb17a72e3785?w=800&q=80",
    "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
  ],
  categories: [
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    "https://images.unsplash.com/photo-1471286174890-9c112ac6823d?w=800&q=80",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80",
    "https://images.unsplash.com/photo-1476234251651-f353703a034d?w=800&q=80",
  ],
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT DATA — 60 Luxury Women's Fashion Products
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCTS_DATA = [
  // DRESSES
  { name: "Celestial Silk Maxi Dress", cat: "Dresses", price: 389, original: 520, images: IMAGES.dresses, colors: ["Ivory", "Midnight Blue", "Rose Gold"], desc: "Fluid silk-blend maxi dress with celestial embroidery at the hem. Perfect for evening soirées and garden parties alike. Features a delicate V-neckline and adjustable tie waist." },
  { name: "Velvet Noir Cocktail Dress", cat: "Dresses", price: 295, original: 410, images: IMAGES.dresses, colors: ["Black", "Burgundy"], desc: "Luxuriously soft crushed velvet cocktail dress with a fitted silhouette and subtle slit. Lined in pure silk charmeuse for a second-skin comfort." },
  { name: "Garden Party Floral Wrap Dress", cat: "Dresses", price: 248, original: null, images: IMAGES.dresses, colors: ["Blush Pink", "Sage Green", "Cream"], desc: "Romantic wrap dress in lightweight crêpe de chine with an all-over botanical print. Adjustable tie closure and flutter sleeves." },
  { name: "Structured Power Midi Dress", cat: "Dresses", price: 320, original: 440, images: IMAGES.dresses, colors: ["Camel", "Charcoal", "Cobalt"], desc: "Tailored power-dressing midi with structured shoulders and a nipped-in waist. Crafted from Italian stretch-wool blend." },
  { name: "Ethereal Chiffon Slip Dress", cat: "Dresses", price: 198, original: null, images: IMAGES.dresses, colors: ["Champagne", "Blush", "Sky Blue"], desc: "Effortlessly chic layered chiffon slip dress with delicate lace trim. Bias-cut for a sensuous drape." },
  { name: "Belted Shirt Dress", cat: "Dresses", price: 215, original: 295, images: IMAGES.dresses, colors: ["Caramel", "Ecru", "Forest Green"], desc: "Classic shirt dress reinvented in premium Egyptian cotton with a removable leather belt." },
  { name: "Asymmetric Ruffle Gown", cat: "Dresses", price: 560, original: 720, images: IMAGES.dresses, colors: ["Ruby Red", "Onyx"], desc: "Floor-sweeping asymmetric gown with cascading ruffle detail. Sculpted bodice with hidden boning support." },
  { name: "Crochet Lace Mini Dress", cat: "Dresses", price: 175, original: null, images: IMAGES.dresses, colors: ["Cream", "Tan", "White"], desc: "Artisan hand-crochet mini dress with delicate floral motifs. Lined in smooth satin for modesty." },

  // TOPS & BLOUSES
  { name: "Silk Pussybow Blouse", cat: "Tops & Blouses", price: 185, original: 240, images: IMAGES.tops, colors: ["Ivory", "Dusty Rose", "Navy"], desc: "Draped silk pussybow blouse with a relaxed fit. Pairs beautifully with both tailored trousers and denim." },
  { name: "Off-Shoulder Ruffle Top", cat: "Tops & Blouses", price: 135, original: null, images: IMAGES.tops, colors: ["White", "Sage", "Terracotta"], desc: "Breezy off-shoulder top with tiered ruffle detailing in cotton voile." },
  { name: "Cropped Cashmere Knit", cat: "Tops & Blouses", price: 310, original: 420, images: IMAGES.tops, colors: ["Camel", "Ivory", "Dusty Lavender"], desc: "Ultra-soft 100% Grade-A cashmere cropped knit with a ribbed hem and cuffs." },
  { name: "Lace Trim Cami Top", cat: "Tops & Blouses", price: 98, original: null, images: IMAGES.tops, colors: ["Champagne", "Black", "Blush"], desc: "Satin camisole with vintage-inspired Chantilly lace trim at the neckline." },
  { name: "Structured Blazer Top", cat: "Tops & Blouses", price: 248, original: 330, images: IMAGES.tops, colors: ["Cream", "Charcoal", "Powder Blue"], desc: "Refined single-button blazer in Italian ponte fabric. Nipped waist and wide lapels." },
  { name: "Breezy Linen Button-Down", cat: "Tops & Blouses", price: 155, original: null, images: IMAGES.tops, colors: ["White", "Stone", "Pale Yellow"], desc: "Relaxed-fit stonewashed linen shirt with mother-of-pearl buttons." },

  // PANTS & TROUSERS
  { name: "Wide-Leg Palazzo Trousers", cat: "Pants & Trousers", price: 265, original: 360, images: IMAGES.pants, colors: ["Ivory", "Black", "Caramel"], desc: "Sweeping palazzo trousers in flowing viscose. High-rise waist with a concealed zip." },
  { name: "Tailored Cigarette Pants", cat: "Pants & Trousers", price: 290, original: null, images: IMAGES.pants, colors: ["Charcoal", "Camel", "Navy"], desc: "Slim-fit cigarette pants in Italian stretch gabardine. Cut to ankle length with a pressed crease." },
  { name: "Satin Track Pants", cat: "Pants & Trousers", price: 178, original: 240, images: IMAGES.pants, colors: ["Champagne", "Black", "Sage"], desc: "Luxe satin-finish track pants with side stripe detail. Elasticated waist with drawstring." },
  { name: "High-Waist Flare Jeans", cat: "Pants & Trousers", price: 195, original: null, images: IMAGES.pants, colors: ["Indigo", "Black", "Light Wash"], desc: "Vintage-inspired high-waist flare jeans in premium Japanese selvedge denim." },
  { name: "Leather Look Leggings", cat: "Pants & Trousers", price: 145, original: 200, images: IMAGES.pants, colors: ["Black", "Dark Brown"], desc: "Second-skin faux leather leggings with bonded construction. Waistband with logo elastic." },
  { name: "Linen Drawstring Trousers", cat: "Pants & Trousers", price: 168, original: null, images: IMAGES.pants, colors: ["Sand", "White", "Olive"], desc: "Easy-wear linen trousers with a relaxed straight leg and elastic drawstring waist." },

  // SKIRTS
  { name: "Pleated Midi Skirt", cat: "Skirts", price: 198, original: 270, images: IMAGES.skirts, colors: ["Champagne", "Blush", "Sage"], desc: "Elegant pleated midi skirt in silk-like satin. Knife pleats arranged symmetrically for fluid movement." },
  { name: "Leather Pencil Skirt", cat: "Skirts", price: 320, original: 430, images: IMAGES.skirts, colors: ["Black", "Cognac"], desc: "Sleek genuine leather pencil skirt with a back vent for ease. Fully lined in silk." },
  { name: "Floral Wrap Mini Skirt", cat: "Skirts", price: 128, original: null, images: IMAGES.skirts, colors: ["Floral Pink", "Tropical Blue"], desc: "Vivid floral print wrap mini skirt in crinkle chiffon with a tiered hem." },
  { name: "Tulle Ballerina Skirt", cat: "Skirts", price: 245, original: 310, images: IMAGES.skirts, colors: ["Ballet Pink", "Black", "Ivory"], desc: "Romantic multi-layer tulle skirt with a velvet waistband. Midi length with subtle structure." },

  // OUTERWEAR
  { name: "Camel Wool Overcoat", cat: "Outerwear", price: 680, original: 890, images: IMAGES.outerwear, colors: ["Camel", "Charcoal", "Ivory"], desc: "Impeccably tailored double-face wool overcoat. Notch lapels, double-breasted closure, fully lined in cupro." },
  { name: "Belted Trench Coat", cat: "Outerwear", price: 540, original: 720, images: IMAGES.outerwear, colors: ["Khaki", "Navy", "Black"], desc: "Iconic belted trench coat in water-repellent cotton gabardine with storm flaps and deep pockets." },
  { name: "Shearling-Trim Puffer", cat: "Outerwear", price: 485, original: null, images: IMAGES.outerwear, colors: ["Ivory", "Mocha", "Black"], desc: "Luxe quilted puffer jacket with genuine shearling collar trim. Lightweight down fill for exceptional warmth." },
  { name: "Oversized Blazer Coat", cat: "Outerwear", price: 420, original: 560, images: IMAGES.outerwear, colors: ["Stone", "Charcoal", "Blush"], desc: "Oversized double-breasted blazer coat in Italian boucle wool. Statement silhouette for city dressing." },
  { name: "Leather Moto Jacket", cat: "Outerwear", price: 595, original: 780, images: IMAGES.outerwear, colors: ["Black", "Cognac", "Blush"], desc: "Classic moto jacket in full-grain lambskin leather. Asymmetric zip, epaulettes and zippered cuffs." },
  { name: "Faux Fur Statement Coat", cat: "Outerwear", price: 450, original: null, images: IMAGES.outerwear, colors: ["Snow White", "Champagne", "Onyx"], desc: "Showstopping faux fur coat in plush teddy pile. Oversized fit with deep lapels and no closure for effortless style." },

  // BAGS & ACCESSORIES
  { name: "Mini Quilted Chain Bag", cat: "Bags & Accessories", price: 420, original: 560, images: IMAGES.bags, colors: ["Black", "Beige", "Pink"], desc: "Iconic mini bag in quilted lambskin with interlocking CC chain strap. Gold-tone hardware throughout." },
  { name: "Structured Top-Handle Tote", cat: "Bags & Accessories", price: 680, original: 900, images: IMAGES.bags, colors: ["Tan", "Black", "Cream"], desc: "Architectural top-handle tote in full-grain Italian leather. Suede interior with zip pocket." },
  { name: "Crescent Shoulder Bag", cat: "Bags & Accessories", price: 345, original: null, images: IMAGES.bags, colors: ["Cognac", "Cream", "Sage"], desc: "Slouchy crescent shoulder bag in pebbled calfskin. Adjustable leather shoulder strap." },
  { name: "Raffia Woven Clutch", cat: "Bags & Accessories", price: 185, original: 240, images: IMAGES.bags, colors: ["Natural", "Black", "Tan"], desc: "Artisanal hand-woven raffia clutch with leather trim and magnetic clasp closure." },
  { name: "City Crossbody Bag", cat: "Bags & Accessories", price: 298, original: null, images: IMAGES.bags, colors: ["Black", "Camel", "Cognac"], desc: "Compact crossbody in smooth calfskin with multiple card slots and a zip-around compartment." },
  { name: "Velvet Evening Clutch", cat: "Bags & Accessories", price: 195, original: 260, images: IMAGES.bags, colors: ["Midnight Blue", "Black", "Ruby"], desc: "Elegant velvet evening clutch with satin lining and detachable chain wrist strap." },

  // SHOES & HEELS
  { name: "Sculptural Block Heel Mule", cat: "Shoes & Heels", price: 368, original: 495, images: IMAGES.shoes, colors: ["Nude", "Black", "Cognac"], desc: "Sophisticated mule with an architectural block heel in polished calfskin. Open toe with a pointed vamp." },
  { name: "Classic Stiletto Pump", cat: "Shoes & Heels", price: 445, original: 595, images: IMAGES.shoes, colors: ["Black", "Nude", "Red"], desc: "Timeless pointed-toe pump on a 90mm stiletto heel. Premium kid leather upper with leather sole." },
  { name: "Platform Mary Jane", cat: "Shoes & Heels", price: 310, original: null, images: IMAGES.shoes, colors: ["Black", "White", "Cherry Red"], desc: "Playful platform Mary Jane with chunky sole and buckle strap. Patent leather for a high-shine finish." },
  { name: "Strappy Heeled Sandal", cat: "Shoes & Heels", price: 295, original: 390, images: IMAGES.shoes, colors: ["Gold", "Silver", "Nude"], desc: "Barely-there strappy sandal on a slender 80mm heel. Adjustable ankle strap." },
  { name: "Chelsea Ankle Boot", cat: "Shoes & Heels", price: 420, original: null, images: IMAGES.shoes, colors: ["Black", "Cognac", "White"], desc: "Refined Chelsea boot in full-grain leather with elastic side panels and a stacked Cuban heel." },
  { name: "Kitten Heel Slingback", cat: "Shoes & Heels", price: 275, original: 365, images: IMAGES.shoes, colors: ["Camel", "Black", "Blush"], desc: "Understated slingback pump with a delicate 40mm kitten heel. Pointed cap toe." },

  // JEWELRY & ACCESSORIES
  { name: "Gold Vermeil Layering Necklaces Set", cat: "Jewelry & Accessories", price: 185, original: 240, images: IMAGES.jewelry, colors: ["Gold", "Rose Gold", "Silver"], desc: "Set of three delicate 18k gold vermeil necklaces designed for layering. Includes a chain, a pendant and a choker." },
  { name: "Sculptural Hoop Earrings", cat: "Jewelry & Accessories", price: 125, original: null, images: IMAGES.jewelry, colors: ["Gold", "Silver"], desc: "Bold oversized hoop earrings with a hammered texture. Sterling silver with 18k gold plating." },
  { name: "Pearl & Chain Bracelet", cat: "Jewelry & Accessories", price: 158, original: 210, images: IMAGES.jewelry, colors: ["Gold/Pearl", "Silver/Pearl"], desc: "Freshwater pearl beads alternating with fine gold chain links. Lobster clasp closure." },
  { name: "Statement Cocktail Ring", cat: "Jewelry & Accessories", price: 210, original: null, images: IMAGES.jewelry, colors: ["Gold", "Silver"], desc: "Architectural cocktail ring set with a marquise-cut cubic zirconia centrepiece." },
  { name: "Silk Scarf — Botanical Print", cat: "Jewelry & Accessories", price: 145, original: 195, images: IMAGES.jewelry, colors: ["Blush & Sage", "Navy & Gold"], desc: "Hand-rolled 100% silk twill scarf in a painterly botanical print. Wear as headscarf, neck tie or bag charm." },
  { name: "Leather Belt — Gold Buckle", cat: "Jewelry & Accessories", price: 118, original: null, images: IMAGES.jewelry, colors: ["Tan", "Black", "White"], desc: "Slim full-grain leather belt with an oversized gold-tone square buckle. 25mm wide." },

  // SWIMWEAR & RESORT
  { name: "Cut-Out Swimsuit", cat: "Swimwear & Resort", price: 198, original: 265, images: IMAGES.tops, colors: ["Black", "Terracotta", "Cobalt"], desc: "Sculpting one-piece with strategic cut-out panels and a high-leg cut. UPF 50+ fabric." },
  { name: "Tie-Front Bikini Top", cat: "Swimwear & Resort", price: 95, original: null, images: IMAGES.tops, colors: ["Coral", "White", "Sage"], desc: "Adjustable tie-front bikini top in Portuguese lycra. Removable padding for custom coverage." },
  { name: "Wide-Brim Raffia Hat", cat: "Swimwear & Resort", price: 145, original: 190, images: IMAGES.bags, colors: ["Natural", "Black Band"], desc: "Artisan hand-woven raffia sun hat with a wide 12cm brim and grosgrain ribbon band." },
  { name: "Linen Beach Kaftan", cat: "Swimwear & Resort", price: 215, original: null, images: IMAGES.dresses, colors: ["White", "Turquoise", "Coral"], desc: "Flowing linen kaftan with embroidered neckline. Slips over a swimsuit or worn as a standalone dress." },

  // ACTIVEWEAR
  { name: "High-Waist Sculpting Leggings", cat: "Activewear", price: 128, original: 168, images: IMAGES.pants, colors: ["Black", "Navy", "Dusty Rose"], desc: "Four-way stretch recycled nylon leggings with a high-rise contour waistband and hidden pocket." },
  { name: "Seamless Sports Bra", cat: "Activewear", price: 78, original: null, images: IMAGES.tops, colors: ["Black", "Sage", "Ivory"], desc: "Medium-support seamless sports bra with racerback design and removable cups." },
  { name: "Oversized Hoodie", cat: "Activewear", price: 145, original: 195, images: IMAGES.outerwear, colors: ["Cream", "Charcoal", "Dusty Lavender"], desc: "Cloud-soft oversized hoodie in premium brushed fleece. Kangaroo pocket and cuffed hem." },
  { name: "Yoga Studio Set", cat: "Activewear", price: 195, original: null, images: IMAGES.pants, colors: ["Sage & Ivory", "Black & Rose"], desc: "Coordinated two-piece yoga set: crop top + high-waist leggings in moisture-wicking performance fabric." },
]

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌸 NeoShop Ultra — Women's Fashion Database Seed Starting...")

  // ── CLEAN DATABASE ──────────────────────────────────────────────────────────
  console.log("🗑️  Clearing existing data...")
  // Use deleteMany in dependency order to avoid FK violations
  await prisma.inventoryMovement.deleteMany()
  await prisma.inventoryReservation.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.shipment.deleteMany()
  await prisma.returnRequest.deleteMany()
  await prisma.refund.deleteMany()
  await prisma.order.deleteMany()
  await prisma.reviewImage.deleteMany()
  await prisma.review.deleteMany()
  await prisma.productQuestion.deleteMany()
  await prisma.productAnswer.deleteMany()
  await prisma.recentlyViewed.deleteMany()
  await prisma.productView.deleteMany()
  await prisma.recommendationEvent.deleteMany()
  await prisma.searchHistory.deleteMany()
  await prisma.abandonedCart.deleteMany()
  await prisma.productAttribute.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.flashSale.deleteMany()
  await prisma.collection.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.category.deleteMany()
  await prisma.warehouse.deleteMany()
  await prisma.loyaltyTransaction.deleteMany()
  await prisma.loyaltyPoint.deleteMany()
  await prisma.storeCredit.deleteMany()
  await prisma.giftCard.deleteMany()
  await prisma.emailSubscriber.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.marketingCampaign.deleteMany()
  await prisma.heroBanner.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.blogCategory.deleteMany()
  await prisma.blogTag.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.financialDLQ.deleteMany()
  await prisma.idempotencyRecord.deleteMany()
  await prisma.domainEventLog.deleteMany()
  await prisma.webhookEvent.deleteMany()
  await prisma.sessionLog.deleteMany()
  await prisma.deviceFingerprint.deleteMany()
  await prisma.address.deleteMany()
  await prisma.courier.deleteMany()
  await prisma.user.deleteMany()
  console.log("✅ Database cleared.")

  // ── WAREHOUSE ───────────────────────────────────────────────────────────────
  const warehouse = await prisma.warehouse.create({
    data: { name: "NeoShop Fulfilment Centre", location: "London, UK", isActive: true },
  })
  console.log("🏭 Warehouse created.")

  // ── CATEGORIES ──────────────────────────────────────────────────────────────
  const categoryData = [
    { name: "Dresses", slug: "dresses", image: IMAGES.categories[0] },
    { name: "Tops & Blouses", slug: "tops-blouses", image: IMAGES.categories[1] },
    { name: "Pants & Trousers", slug: "pants-trousers", image: IMAGES.categories[2] },
    { name: "Skirts", slug: "skirts", image: IMAGES.categories[3] },
    { name: "Outerwear", slug: "outerwear", image: IMAGES.categories[4] },
    { name: "Bags & Accessories", slug: "bags-accessories", image: IMAGES.categories[5] },
    { name: "Shoes & Heels", slug: "shoes-heels", image: IMAGES.categories[6] },
    { name: "Jewelry & Accessories", slug: "jewelry-accessories", image: IMAGES.categories[7] },
    { name: "Swimwear & Resort", slug: "swimwear-resort", image: IMAGES.categories[0] },
    { name: "Activewear", slug: "activewear", image: IMAGES.categories[1] },
  ]
  const categories = await Promise.all(
    categoryData.map((c) =>
      prisma.category.create({
        data: { ...c, description: `Luxury women's ${c.name.toLowerCase()}` },
      })
    )
  )
  const catMap = Object.fromEntries(categories.map((c) => [c.name, c]))
  console.log(`📂 ${categories.length} categories created.`)

  // ── BRANDS ──────────────────────────────────────────────────────────────────
  const brandData = [
    { name: "Maison Élite", slug: "maison-elite", description: "Parisian haute couture for the modern woman" },
    { name: "Aurélia London", slug: "aurelia-london", description: "British luxury with a minimalist aesthetic" },
    { name: "Solène Milano", slug: "solene-milano", description: "Italian craftsmanship meets contemporary femininity" },
    { name: "Vivienne Noir", slug: "vivienne-noir", description: "Dark romance and architectural silhouettes" },
    { name: "Terra Botanica", slug: "terra-botanica", description: "Nature-inspired sustainable luxury fashion" },
    { name: "Lumière Studio", slug: "lumiere-studio", description: "Light-filled, effortless Riviera dressing" },
  ]
  const brands = await Promise.all(
    brandData.map((b) => prisma.brand.create({ data: b }))
  )
  console.log(`🏷️  ${brands.length} brands created.`)

  // ── COLLECTIONS ─────────────────────────────────────────────────────────────
  const collectionsData = [
    { name: "Riviera Summer 2026", slug: "riviera-summer-2026", image: IMAGES.dresses[0], description: "Sun-drenched Mediterranean style" },
    { name: "Noir Lumière AW26", slug: "noir-lumiere-aw26", image: IMAGES.outerwear[0], description: "Moody autumn/winter editorial collection" },
    { name: "The Silk Edit", slug: "the-silk-edit", image: IMAGES.tops[0], description: "Curated silk pieces for every occasion" },
    { name: "Power Dressing", slug: "power-dressing", image: IMAGES.pants[0], description: "Boardroom to bar — the modern power wardrobe" },
    { name: "Weekend Escape", slug: "weekend-escape", image: IMAGES.bags[0], description: "Effortless weekend pieces for the jet-setter" },
  ]
  const collections = await Promise.all(
    collectionsData.map((c) => prisma.collection.create({ data: c }))
  )
  console.log(`✨ ${collections.length} collections created.`)

  // ── PRODUCTS ─────────────────────────────────────────────────────────────────
  const sizes = ["XS", "S", "M", "L", "XL"]
  const accessorySizes = ["ONE SIZE"]
  const jewelerySizes = ["ONE SIZE"]
  const shoeSizes = ["36", "37", "38", "39", "40", "41"]

  const isShoeCat = (cat: string) => cat === "Shoes & Heels"
  const isAccessoryCat = (cat: string) => cat === "Bags & Accessories" || cat === "Swimwear & Resort" || cat === "Jewelry & Accessories"

  let productCount = 0

  for (const pd of PRODUCTS_DATA) {
    const cat = catMap[pd.cat]
    if (!cat) { console.warn(`⚠️  Category not found: ${pd.cat}`); continue }

    const brand = brands[rand(0, brands.length - 1)]
    const collection = Math.random() > 0.4 ? collections[rand(0, collections.length - 1)] : undefined
    const isFeatured = Math.random() > 0.65

    // Build images — use 3 real images from the pool
    const imgPool = pd.images
    const [img1, img2, img3] = [pick(imgPool), pick(imgPool), pick(imgPool)]

    // Build variants — sizes × colors
    const sizesToUse = isShoeCat(pd.cat) ? shoeSizes : isAccessoryCat(pd.cat) ? accessorySizes : sizes

    const variantRows: any[] = []
    for (const size of sizesToUse) {
      for (const colorName of pd.colors) {
        const skuSuffix = `${size}-${colorName.replace(/\s+/g, "")}-${Date.now()}-${rand(100, 999)}`
        variantRows.push({
          sku: `NS-${pd.cat.substring(0, 3).toUpperCase()}-${skuSuffix}`.replace(/[^A-Z0-9-]/gi, "").substring(0, 40),
          size,
          color: colorName,
          colorName,
          isActive: true,
        })
      }
    }

    const product = await prisma.product.create({
      data: {
        name: pd.name,
        slug: slugify(pd.name),
        description: pd.desc,
        price: pd.price,
        originalPrice: pd.original ?? undefined,
        gender: ProductGender.WOMEN,
        isActive: true,
        isFeatured,
        categoryId: cat.id,
        brandId: brand.id,
        collectionId: collection?.id,
        images: {
          create: [
            { url: img1, alt: `${pd.name} — Front View`, isFeatured: true, sortOrder: 1 },
            { url: img2, alt: `${pd.name} — Detail View`, isFeatured: false, sortOrder: 2 },
            { url: img3, alt: `${pd.name} — Style View`, isFeatured: false, sortOrder: 3 },
          ],
        },
        attributes: {
          create: [
            { name: "Material", value: pick(["100% Silk", "Italian Wool", "French Linen", "Egyptian Cotton", "Cashmere Blend", "Lambskin Leather", "Recycled Nylon", "Organic Cotton"]) },
            { name: "Care", value: pick(["Dry Clean Only", "Hand Wash Cold", "Machine Wash 30°C", "Spot Clean Only"]) },
            { name: "Fit", value: pick(["True to Size", "Runs Small — Size Up", "Runs Large — Size Down", "Relaxed Fit"]) },
            { name: "Made In", value: pick(["Italy", "France", "Portugal", "UK", "Japan"]) },
          ],
        },
        variants: {
          create: variantRows,
        },
      },
      include: { variants: true },
    })

    // Add inventory for each variant
    for (const variant of product.variants) {
      await prisma.inventory.create({
        data: {
          variantId: variant.id,
          warehouseId: warehouse.id,
          quantity: rand(15, 120),
          reserved: 0,
          location: `A${rand(1, 9)}-B${rand(10, 99)}`,
        },
      })
    }

    productCount++
    if (productCount % 10 === 0) console.log(`  📦 ${productCount} products seeded...`)
  }
  console.log(`✅ ${productCount} products created with variants & inventory.`)

  // ── ADMIN & CUSTOMER USERS ──────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 12)

  const admin = await prisma.user.create({
    data: {
      email: "admin@neoshop.com",
      passwordHash,
      name: "Sophie Laurent",
      role: "ADMIN",
      isActive: true,
      emailVerified: new Date(),
    },
  })

  const customers = await Promise.all([
    prisma.user.create({ data: { email: "emma@example.com", passwordHash, name: "Emma Clarke", role: "CUSTOMER", isActive: true, emailVerified: new Date() } }),
    prisma.user.create({ data: { email: "isabella@example.com", passwordHash, name: "Isabella Fontaine", role: "CUSTOMER", isActive: true, emailVerified: new Date() } }),
    prisma.user.create({ data: { email: "olivia@example.com", passwordHash, name: "Olivia Bennett", role: "CUSTOMER", isActive: true, emailVerified: new Date() } }),
    prisma.user.create({ data: { email: "charlotte@example.com", passwordHash, name: "Charlotte Moreau", role: "CUSTOMER", isActive: true, emailVerified: new Date() } }),
    prisma.user.create({ data: { email: "amelia@example.com", passwordHash, name: "Amelia Ross", role: "CUSTOMER", isActive: true, emailVerified: new Date() } }),
  ])
  console.log(`👩 ${customers.length + 1} users created (1 admin + ${customers.length} customers).`)

  // ── ADDRESSES ───────────────────────────────────────────────────────────────
  const addressesData = [
    { userId: customers[0].id, title: "Home", line1: "14 Kensington Gardens", city: "London", state: "England", postalCode: "W8 4PT", country: "United Kingdom", phone: "+44 7700 123456", isDefaultShipping: true, isDefaultBilling: true },
    { userId: customers[1].id, title: "Home", line1: "22 Rue du Faubourg Saint-Honoré", city: "Paris", state: "Île-de-France", postalCode: "75008", country: "France", phone: "+33 6 12 34 56 78", isDefaultShipping: true, isDefaultBilling: true },
    { userId: customers[2].id, title: "Home", line1: "8 Via Montenapoleone", city: "Milan", state: "Lombardy", postalCode: "20121", country: "Italy", phone: "+39 02 7654 3210", isDefaultShipping: true, isDefaultBilling: true },
    { userId: customers[3].id, title: "Apartment", line1: "45 Upper East Side", city: "New York", state: "New York", postalCode: "10021", country: "United States", phone: "+1 917 555 0192", isDefaultShipping: true, isDefaultBilling: true },
    { userId: customers[4].id, title: "Home", line1: "3 Sukhumvit Road", city: "Bangkok", state: "Bangkok", postalCode: "10110", country: "Thailand", phone: "+66 81 234 5678", isDefaultShipping: true, isDefaultBilling: true },
  ]
  const addresses = await Promise.all(addressesData.map((a) => prisma.address.create({ data: a })))
  console.log(`📍 ${addresses.length} addresses created.`)

  // ── COURIERS ────────────────────────────────────────────────────────────────
  const couriers = await Promise.all([
    prisma.courier.create({ data: { name: "James Whitfield", phone: "+44 7911 000001", email: "james@courier.com", isActive: true } }),
    prisma.courier.create({ data: { name: "Sofia Marlowe", phone: "+44 7911 000002", email: "sofia@courier.com", isActive: true } }),
  ])

  // ── ORDERS ──────────────────────────────────────────────────────────────────
  const allProducts = await prisma.product.findMany({ include: { variants: { take: 1 } } })
  const validProducts = allProducts.filter((p) => p.variants.length > 0)

  const orderStatuses: OrderStatus[] = ["DELIVERED", "SHIPPED", "PROCESSING", "PAID", "PENDING", "CANCELLED"]

  for (let i = 0; i < 20; i++) {
    const customer = customers[i % customers.length]
    const address = addresses[i % addresses.length]
    const product1 = validProducts[rand(0, validProducts.length - 1)]
    const product2 = validProducts[rand(0, validProducts.length - 1)]
    const variant1 = product1.variants[0]
    const variant2 = product2.variants[0]
    const qty1 = rand(1, 2)
    const qty2 = rand(1, 2)
    const item1Total = product1.price * qty1
    const item2Total = product2.price * qty2
    const subtotal = parseFloat((item1Total + item2Total).toFixed(2))
    const tax = parseFloat((subtotal * 0.2).toFixed(2))
    const shipping = 12.5
    const total = parseFloat((subtotal + tax + shipping).toFixed(2))
    const status = orderStatuses[i % orderStatuses.length]

    const order = await prisma.order.create({
      data: {
        orderNumber: `NSU-${String(Date.now()).slice(-8)}-${String(i).padStart(3, "0")}`,
        userId: customer.id,
        status,
        subtotal,
        tax,
        shippingCost: shipping,
        discount: 0,
        total,
        shippingAddressId: address.id,
        billingAddressId: address.id,
        createdAt: new Date(Date.now() - rand(1, 90) * 24 * 60 * 60 * 1000),
        items: {
          create: [
            { variantId: variant1.id, quantity: qty1, price: product1.price, total: item1Total },
            { variantId: variant2.id, quantity: qty2, price: product2.price, total: item2Total },
          ],
        },
      },
    })

    // Add payment for paid+ orders
    if (!["PENDING", "CANCELLED"].includes(status)) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          transactionId: `pi_${Date.now()}_${rand(10000, 99999)}`,
          amount: total,
          status: PaymentStatus.COMPLETED,
          cardBrand: pick(["visa", "mastercard", "amex"]),
          cardLast4: String(rand(1000, 9999)),
        },
      })
    }

    // Add shipment for shipped/delivered orders
    if (["SHIPPED", "DELIVERED"].includes(status)) {
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          carrier: pick(["DHL Express", "FedEx Priority", "UPS Worldwide"]),
          trackingNumber: `TRK${rand(100000000, 999999999)}`,
          status: status === "DELIVERED" ? "DELIVERED" : "IN_TRANSIT",
          courierId: pick(couriers).id,
          estimatedDelivery: new Date(Date.now() + rand(1, 7) * 24 * 60 * 60 * 1000),
          actualDelivery: status === "DELIVERED" ? new Date(Date.now() - rand(1, 10) * 24 * 60 * 60 * 1000) : undefined,
        },
      })
    }
  }
  console.log(`📋 20 sample orders created.`)

  // ── COUPONS ─────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.coupon.create({ data: { code: "WELCOME20", discountType: "PERCENTAGE", discountValue: 20, minOrderAmount: 50, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), usageLimit: 1000, isActive: true } }),
    prisma.coupon.create({ data: { code: "LUXURY50", discountType: "FIXED_AMOUNT", discountValue: 50, minOrderAmount: 300, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), usageLimit: 200, isActive: true } }),
    prisma.coupon.create({ data: { code: "RIVIERA15", discountType: "PERCENTAGE", discountValue: 15, minOrderAmount: 150, startDate: new Date("2026-05-01"), endDate: new Date("2026-08-31"), usageLimit: 500, isActive: true } }),
    prisma.coupon.create({ data: { code: "NOIR10", discountType: "PERCENTAGE", discountValue: 10, minOrderAmount: 0, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), isActive: true } }),
    prisma.coupon.create({ data: { code: "VIP100", discountType: "FIXED_AMOUNT", discountValue: 100, minOrderAmount: 500, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), usageLimit: 50, isActive: true } }),
  ])
  console.log(`🎟️  5 coupons created.`)

  // ── REVIEWS ─────────────────────────────────────────────────────────────────
  const reviewableProducts = validProducts.slice(0, 15)
  const reviewTexts = [
    "Absolutely stunning quality. The fabric drapes beautifully and I received so many compliments.",
    "Worth every penny. The craftsmanship is impeccable — this is a forever piece.",
    "Fit perfectly true to size. The colour is even more beautiful in person.",
    "Luxurious and comfortable. Exactly what I was looking for.",
    "I've worn this to three events now and always feel incredible. A true investment piece.",
    "Exceeded my expectations. Arrives beautifully packaged too.",
    "The material quality is outstanding. I can tell this will last for years.",
    "Elegant and versatile — I've styled it five different ways already.",
    "Perfect fit, gorgeous colour, arrived promptly. Couldn't be happier.",
    "My absolute favourite purchase this season. Highly recommend.",
  ]

  let reviewCount = 0
  for (const product of reviewableProducts) {
    const numReviews = rand(2, 4)
    for (let r = 0; r < numReviews; r++) {
      const customer = customers[rand(0, customers.length - 1)]
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: customer.id,
          rating: rand(4, 5),
          comment: pick(reviewTexts),
        },
      }).catch(() => {}) // ignore duplicate user+product reviews
      reviewCount++
    }
  }
  console.log(`⭐ ~${reviewCount} reviews seeded.`)

  // ── HERO BANNERS ────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.heroBanner.create({ data: { title: "Riviera Summer 2026", subtitle: "Effortless elegance from the sun-drenched Côte d'Azur", image: IMAGES.dresses[0], link: "/products?collection=riviera-summer-2026", isActive: true, sortOrder: 1 } }),
    prisma.heroBanner.create({ data: { title: "The Power Wardrobe", subtitle: "Command every room. Discover the new season edit.", image: IMAGES.outerwear[0], link: "/products?collection=power-dressing", isActive: true, sortOrder: 2 } }),
    prisma.heroBanner.create({ data: { title: "The Silk Edit", subtitle: "Fluid, sensuous, timeless. Silk redefined.", image: IMAGES.tops[0], link: "/products?collection=the-silk-edit", isActive: true, sortOrder: 3 } }),
  ])
  console.log(`🖼️  3 hero banners created.`)

  // ── BLOG CATEGORIES & POSTS ─────────────────────────────────────────────────
  const blogCat = await prisma.blogCategory.create({ data: { name: "Style & Fashion", slug: "style-fashion" } })
  await Promise.all([
    prisma.blogPost.create({ data: { title: "10 Ways to Style a Silk Blouse", slug: "10-ways-to-style-a-silk-blouse", content: "The silk blouse is the ultimate wardrobe workhorse...", excerpt: "From boardroom to weekend brunch, the silk blouse does it all.", published: true, publishedAt: new Date(), authorId: admin.id, categoryId: blogCat.id, coverImage: IMAGES.tops[0] } }),
    prisma.blogPost.create({ data: { title: "The Art of Layering Jewellery", slug: "the-art-of-layering-jewellery", content: "Jewellery layering is a skill that transforms any look...", excerpt: "Master the art of mixing metals, textures and lengths.", published: true, publishedAt: new Date(), authorId: admin.id, categoryId: blogCat.id, coverImage: IMAGES.jewelry[0] } }),
    prisma.blogPost.create({ data: { title: "Investment Pieces Worth Saving For", slug: "investment-pieces-worth-saving-for", content: "Some pieces transcend seasons and trends...", excerpt: "The luxury buys that will last a lifetime.", published: true, publishedAt: new Date(), authorId: admin.id, categoryId: blogCat.id, coverImage: IMAGES.outerwear[1] } }),
  ])
  console.log(`📝 Blog posts created.`)

  // ── EMAIL SUBSCRIBERS ───────────────────────────────────────────────────────
  await Promise.all(
    ["style@example.com", "fashion@example.com", "luxury@example.com", "trends@example.com"].map((email, i) =>
      prisma.emailSubscriber.create({ data: { email, token: `unsub-token-${i}-${Date.now()}`, status: "ACTIVE" } })
    )
  )

  // ── LOYALTY POINTS ──────────────────────────────────────────────────────────
  for (const customer of customers) {
    const loyalty = await prisma.loyaltyPoint.create({
      data: { userId: customer.id, pointsBalance: rand(100, 2500) },
    })
    await prisma.loyaltyTransaction.create({
      data: { loyaltyPointId: loyalty.id, points: loyalty.pointsBalance, reason: "WELCOME_BONUS" },
    })
  }
  console.log(`💎 Loyalty points seeded for all customers.`)

  console.log("\n🎉 ════════════════════════════════════════════════")
  console.log("   NeoShop Ultra seed complete!")
  console.log(`   📦 ${productCount} luxury women's fashion products`)
  console.log(`   👥 ${customers.length + 1} users  |  📋 20 orders  |  🎟️  5 coupons`)
  console.log("   Login: admin@neoshop.com / password123")
  console.log("   Login: emma@example.com / password123")
  console.log("════════════════════════════════════════════════\n")
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
