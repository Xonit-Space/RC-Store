import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Starting comprehensive seed...')

  // 1. Create Makes & Models
  const traxxas = await prisma.vehicleMake.upsert({
    where: { slug: 'traxxas' },
    update: {},
    create: { name: 'Traxxas', slug: 'traxxas' }
  })
  const arrma = await prisma.vehicleMake.upsert({
    where: { slug: 'arrma' },
    update: {},
    create: { name: 'Arrma', slug: 'arrma' }
  })

  const slash = await prisma.vehicleModel.upsert({
    where: { slug: 'slash-4x4' },
    update: {},
    create: { makeId: traxxas.id, name: 'Slash 4x4', slug: 'slash-4x4', scale: '1:10', type: 'Short Course Truck' }
  })
  const xmaxx = await prisma.vehicleModel.upsert({
    where: { slug: 'x-maxx' },
    update: {},
    create: { makeId: traxxas.id, name: 'X-Maxx', slug: 'x-maxx', scale: '1:5', type: 'Monster Truck' }
  })

  // 2. Create Addons
  const addonsData = [
    { name: 'Power Cell 3S LiPo 5000mAh', slug: 'power-cell-3s-lipo', price: 89.99, description: 'High output 3S LiPo battery.', image: 'https://images.unsplash.com/photo-1596557551468-23eb46b40e94?auto=format&fit=crop&q=80&w=400' },
    { name: 'EZ-Peak Plus Charger', slug: 'ez-peak-plus-charger', price: 59.99, description: 'Fast and safe LiPo charger.', image: 'https://images.unsplash.com/photo-1596557551468-23eb46b40e94?auto=format&fit=crop&q=80&w=400' },
    { name: 'Essential Tool Kit', slug: 'essential-tool-kit', price: 29.99, description: 'Hex drivers, wrenches, and more.', image: 'https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&q=80&w=400' }
  ]
  const createdAddons = []
  for (const addon of addonsData) {
    const a = await prisma.addon.upsert({
      where: { slug: addon.slug },
      update: {},
      create: addon
    })
    createdAddons.push(a)
  }

  // 3. Create Parts (Products)
  const categoryId = 'cmqv4w35z000eudgk4ez7urmg' // Parts Category from DB
  const partsData = [
    { 
      name: 'Heavy-Duty Suspension Arms', 
      slug: 'heavy-duty-suspension-arms', 
      price: 14.99,
      categoryId,
      description: 'Upgraded heavy-duty suspension arms for extreme bashing.',
      images: ['https://images.unsplash.com/photo-1580922896567-c1d42813cbdf?auto=format&fit=crop&q=80&w=600'],
      models: [slash.id]
    },
    { 
      name: 'Steel Splined Driveshafts', 
      slug: 'steel-splined-driveshafts', 
      price: 49.99,
      categoryId,
      description: 'Durable steel driveshafts to handle 3S power.',
      images: ['https://images.unsplash.com/photo-1616008691884-259df95b3d9d?auto=format&fit=crop&q=80&w=600'],
      models: [slash.id, xmaxx.id]
    },
    { 
      name: 'Velineon 3500 Brushless Motor', 
      slug: 'velineon-3500-motor', 
      price: 89.99,
      categoryId,
      description: 'Extreme power brushless motor upgrade.',
      images: ['https://images.unsplash.com/photo-1563209503-623c2140f0c0?auto=format&fit=crop&q=80&w=600'],
      models: [slash.id]
    }
  ]

  for (const part of partsData) {
    const { models, images, ...productData } = part
    
    // Create product
    const p = await prisma.product.upsert({
      where: { slug: part.slug },
      update: {},
      create: {
        ...productData,
        images: {
          create: images.map(url => ({ url, isMain: true, alt: part.name }))
        }
      }
    })

    // Link to vehicle models
    for (const modelId of models) {
      await prisma.partCompatibility.upsert({
        where: {
          productId_vehicleModelId: {
            productId: p.id,
            vehicleModelId: modelId
          }
        },
        update: {},
        create: {
          productId: p.id,
          vehicleModelId: modelId
        }
      })
    }
  }

  // 4. Create Main Product & link Addons
  const mainProduct = await prisma.product.upsert({
    where: { slug: 'traxxas-slash-4x4-vxl' },
    update: {},
    create: {
      name: 'Traxxas Slash 4x4 VXL',
      slug: 'traxxas-slash-4x4-vxl',
      price: 399.99,
      categoryId: 'cmqv4w35z000dudgkemfjr2l2', // Cars & Trucks
      description: 'The ultimate 1/10 scale short course truck with Velineon brushless power.',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1594732159049-7cce677ec224?auto=format&fit=crop&q=80&w=600', isMain: true, alt: 'Slash 4x4' }
        ]
      }
    }
  })

  // Link Addons to main product
  for (const addon of createdAddons) {
    await prisma.productAddon.upsert({
      where: {
        productId_addonId: {
          productId: mainProduct.id,
          addonId: addon.id
        }
      },
      update: {},
      create: {
        productId: mainProduct.id,
        addonId: addon.id
      }
    })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
