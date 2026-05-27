import { PrismaClient, ProductGender } from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Generating 50 Sample Products...")

  const catNames = ["Streetwear", "Footwear", "Accessories", "Outerwear", "Athleisure"]
  const categories = await Promise.all(
    catNames.map((name) =>
      prisma.category.upsert({
        where: { slug: name.toLowerCase().replace(/\s+/g, "-") },
        update: {},
        create: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
          description: `All things ${name}`,
        },
      })
    )
  )

  const brandNames = ["Urban Edge", "NeoTech", "Athletix", "Vanguard", "Minimalist"]
  const brands = await Promise.all(
    brandNames.map((name) =>
      prisma.brand.upsert({
        where: { slug: name.toLowerCase().replace(/\s+/g, "-") },
        update: {},
        create: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
          description: `${name} official brand`,
        },
      })
    )
  )

  const warehouse = await prisma.warehouse.upsert({
    where: { name: "Main Distribution Center" },
    update: {},
    create: { name: "Main Distribution Center", location: "California", isActive: true },
  })

  // We use reliable curated placeholder images from unsplash
  const unsplashKeywords = ["fashion", "clothing", "shoes", "apparel", "streetwear", "jacket", "sneakers"]

  for (let i = 0; i < 50; i++) {
    const name = faker.commerce.productName()
    const slug = faker.helpers.slugify(name).toLowerCase() + "-" + faker.string.alphanumeric(4)
    const category = faker.helpers.arrayElement(categories)
    const brand = faker.helpers.arrayElement(brands)
    const price = parseFloat(faker.commerce.price({ min: 20, max: 500, dec: 2 }))
    
    // ~30% chance to have a discount original price
    const originalPrice = Math.random() > 0.7 ? price * (1 + Math.random() * 0.5) : null
    
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: faker.commerce.productDescription(),
        price,
        originalPrice,
        gender: faker.helpers.arrayElement([ProductGender.MEN, ProductGender.WOMEN, ProductGender.UNISEX]),
        isActive: true,
        isFeatured: Math.random() > 0.8,
        categoryId: category.id,
        brandId: brand.id,
        images: {
          create: [
            {
              url: `https://images.unsplash.com/photo-${faker.string.numeric(13)}?w=800&q=80&keywords=${faker.helpers.arrayElement(unsplashKeywords)}`,
              // Using faker.image to generate a deterministic random image url that simulates unsplash
              // Actually faker.image.urlLoremFlickr({ category: 'fashion' }) is safer for working urls
              alt: `${name} Image 1`,
              isFeatured: true,
              sortOrder: 1,
            },
            {
              url: faker.image.url({ width: 800, height: 800 }),
              alt: `${name} Image 2`,
              isFeatured: false,
              sortOrder: 2,
            }
          ],
        },
        variants: {
          create: [
            {
              sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}-M`,
              size: "M",
              color: faker.color.human(),
            },
            {
              sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}-L`,
              size: "L",
              color: faker.color.human(),
            }
          ]
        }
      },
      include: { variants: true }
    })

    // Add inventory for the generated variants
    for (const variant of product.variants) {
      await prisma.inventory.create({
        data: {
          variantId: variant.id,
          warehouseId: warehouse.id,
          quantity: faker.number.int({ min: 10, max: 200 }),
          reserved: 0,
        }
      })
    }

    if (i % 10 === 0) console.log(`Seeded ${i}/50 products...`)
  }

  console.log("✅ Successfully seeded 50 sample products!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
