"use server"

import { db } from "@/lib/db"
import { logger } from "@/lib/logger"

export async function getActiveCurrencies() {
  try {
    const currencies = await db.currency.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        symbol: true,
        exchangeRate: true,
      },
      orderBy: { code: 'asc' },
    })

    // Map Prisma Decimal to number for client components
    return currencies.map(c => ({
      ...c,
      exchangeRate: Number(c.exchangeRate),
    }))
  } catch (error) {
    logger.error({ message: "Failed to fetch active currencies", error })
    return []
  }
}
