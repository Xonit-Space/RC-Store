import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Find a demo user
  const user = await prisma.user.findFirst({
    where: { role: 'CUSTOMER' }
  })
  if (!user) throw new Error("No customer found")

  // 2. Find a product variant
  const variant = await prisma.productVariant.findFirst({
    include: { product: true }
  })
  if (!variant) throw new Error("No product variant found")

  // 3. Find a coupon
  const coupon = await prisma.coupon.findFirst({
    where: { isActive: true }
  })
  if (!coupon) throw new Error("No active coupon found")

  // 4. Find or create an address
  let address = await prisma.address.findFirst({
    where: { userId: user.id }
  })
  
  if (!address) {
    address = await prisma.address.create({
      data: {
        userId: user.id,
        title: "Home",
        line1: "123 Demo St",
        city: "Demo City",
        state: "DC",
        postalCode: "12345",
        country: "US",
        phone: "+1234567890"
      }
    })
  }

  // 5. Calculate prices
  const price = variant.price || variant.product.price
  const qty = 1
  const subtotal = Number(price) * qty
  
  let discount = 0
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (subtotal * Number(coupon.discountValue)) / 100
  } else {
    discount = Number(coupon.discountValue)
  }
  
  const tax = (subtotal - discount) * 0.08
  const shipping = 15
  const total = (subtotal - discount) + tax + shipping

  // 6. Create Order
  const orderNumber = `ORD-${Date.now()}`
  
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: user.id,
      status: 'PAID',
      subtotal,
      tax,
      shippingCost: shipping,
      discount,
      total,
      shippingAddressId: address.id,
      billingAddressId: address.id,
      couponId: coupon.id,
      items: {
        create: [
          {
            variantId: variant.id,
            quantity: qty,
            price: price,
            total: subtotal
          }
        ]
      },
      payment: {
        create: {
          gateway: 'STRIPE',
          transactionId: `pi_test_${Date.now()}`,
          amount: total,
          status: 'COMPLETED'
        }
      }
    },
    include: {
      items: true,
      payment: true
    }
  })

  console.log(`Successfully created test order: ${order.orderNumber}`)
  console.log(`User: ${user.email}`)
  console.log(`Product: ${variant.product.name}`)
  console.log(`Coupon Applied: ${coupon.code} (-$${discount})`)
  console.log(`Total: $${total}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
