import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding demo accounts...")

  const users = [
    {
      email: "admin@neoshop.com",
      name: "Admin User",
      password: "Admin123!",
      role: "ADMIN" as const,
    },
    {
      email: "staff@neoshop.com",
      name: "Staff User",
      password: "Staff123!",
      role: "ADMIN" as const, // Fallback to ADMIN since STAFF doesn't exist in schema
    },
    {
      email: "customer@neoshop.com",
      name: "Customer User",
      password: "Customer123!",
      role: "CUSTOMER" as const,
    },
  ]

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12)
    
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash,
        name: user.name,
        role: user.role,
      },
      create: {
        email: user.email,
        passwordHash,
        name: user.name,
        role: user.role,
      },
    })
    console.log(`Upserted user: ${user.email}`)
  }

  console.log("Demo accounts seeded successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
