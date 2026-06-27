import { NextResponse } from "next/server"

// Popular currencies to show in the switcher (curated subset of 170+)
const POPULAR_CURRENCIES: Record<string, string> = {
  AUD: "A$",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  CHF: "CHF",
  CNY: "¥",
  HKD: "HK$",
  SGD: "S$",
  INR: "₹",
  NZD: "NZ$",
  MXN: "MX$",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  KRW: "₩",
  BRL: "R$",
  ZAR: "R",
  AED: "د.إ",
  THB: "฿",
  MYR: "RM",
  LKR: "Rs",
}

// Cache rates in module memory with 5-minute TTL
let ratesCache: { rates: Record<string, number>; timestamp: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export const revalidate = 300 // ISR revalidate every 5 minutes

export async function GET() {
  try {
    const now = Date.now()

    // Return cached if still fresh
    if (ratesCache && now - ratesCache.timestamp < CACHE_TTL_MS) {
      return buildResponse(ratesCache.rates)
    }

    // Fetch from fxapi.app (no API key required, base = AUD)
    const response = await fetch("https://fxapi.app/api/aud.json", {
      next: { revalidate: 300 },
      headers: { "Accept": "application/json" },
    })

    if (!response.ok) {
      throw new Error(`fxapi.app responded with status ${response.status}`)
    }

    const json = await response.json()
    const rates: Record<string, number> = json.rates || {}

    if (Object.keys(rates).length === 0) {
      throw new Error("Empty rates from fxapi.app")
    }

    // Cache the result
    ratesCache = { rates, timestamp: now }

    return buildResponse(rates)
  } catch (error) {
    console.error("[Currency API] Failed to fetch live rates:", error)

    // Return last cached rates if available, even if stale
    if (ratesCache) {
      return buildResponse(ratesCache.rates, true)
    }

    // Final fallback with hardcoded approximate rates
    return buildResponse(FALLBACK_RATES, true)
  }
}

function buildResponse(allRates: Record<string, number>, stale = false) {
  const currencies = Object.entries(POPULAR_CURRENCIES)
    .filter(([code]) => allRates[code] !== undefined || code === "AUD")
    .map(([code, symbol]) => ({
      code,
      symbol,
      name: CURRENCY_NAMES[code] || code,
      exchangeRate: code === "AUD" ? 1 : (allRates[code] ?? 1),
    }))

  return NextResponse.json(
    { currencies, stale, updatedAt: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    }
  )
}

const CURRENCY_NAMES: Record<string, string> = {
  AUD: "Australian Dollar",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  HKD: "Hong Kong Dollar",
  SGD: "Singapore Dollar",
  INR: "Indian Rupee",
  NZD: "New Zealand Dollar",
  MXN: "Mexican Peso",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  KRW: "South Korean Won",
  BRL: "Brazilian Real",
  ZAR: "South African Rand",
  AED: "UAE Dirham",
  THB: "Thai Baht",
  MYR: "Malaysian Ringgit",
  LKR: "Sri Lankan Rupee",
}

// Approximate hardcoded fallback (last resort if API is down)
const FALLBACK_RATES: Record<string, number> = {
  USD: 0.64, EUR: 0.59, GBP: 0.51, JPY: 97.5, CAD: 0.88,
  CHF: 0.57, CNY: 4.65, HKD: 5.0, SGD: 0.86, INR: 53.5,
  NZD: 1.09, MXN: 13.1, SEK: 6.7, NOK: 6.9, DKK: 4.4,
  KRW: 880, BRL: 3.6, ZAR: 11.9, AED: 2.36, THB: 22.5,
  MYR: 3.0, LKR: 195,
}
