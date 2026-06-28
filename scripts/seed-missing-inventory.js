const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log("Finding products without variants...")
  const products = await prisma.product.findMany({
    where: {
      variants: {
        none: {}
      }
    }
  })

  console.log(`Found ${products.length} products without variants.`)

  let count = 0
  for (const product of products) {
    try {
      await prisma.$transaction(async (tx) => {
        const defaultSku = `${product.slug}-DEFAULT`
        const variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: defaultSku,
            size: "Default",
            color: "Default",
            price: product.price,
            inventory: {
              create: {
                quantity: 0,
              }
            }
          }
        })
        console.log(`Created default variant and inventory for product: ${product.name}`)
        count++
      })
    } catch (error) {
      console.error(`Failed to create inventory for product ${product.name}:`, error.message)
    }
  }

  console.log(`\nSuccessfully seeded missing inventory for ${count} products!`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
