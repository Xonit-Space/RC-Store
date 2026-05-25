export interface CurrencyConfig {
  code: string
  symbol: string
  locale: string
  exchangeRate: number // Base USD
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    locale: "en-US",
    exchangeRate: 1.0,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    locale: "de-DE",
    exchangeRate: 0.92,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    locale: "en-GB",
    exchangeRate: 0.79,
  },
  LKR: {
    code: "LKR",
    symbol: "Rs.",
    locale: "si-LK",
    exchangeRate: 300.0,
  },
}

/**
 * Enterprise Price Formatter:
 * Leverages native HTML5 Intl.NumberFormat to render localized currency.
 */
export function formatPrice(amount: number, currencyCode = "USD"): string {
  const currency = CURRENCIES[currencyCode.toUpperCase()] || CURRENCIES.USD
  const convertedAmount = amount * currency.exchangeRate

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
  }).format(convertedAmount)
}

export interface ShippingZone {
  name: string
  countries: string[]
  baseRate: number
  estimatedDays: string
}

export const SHIPPING_ZONES: ShippingZone[] = [
  {
    name: "Domestic USA",
    countries: ["US"],
    baseRate: 0, // Free domestic ground shipping
    estimatedDays: "3-5 business days",
  },
  {
    name: "North America (CA)",
    countries: ["CA"],
    baseRate: 15.0,
    estimatedDays: "5-7 business days",
  },
  {
    name: "Europe",
    countries: ["GB", "DE", "FR", "IT", "ES", "NL"],
    baseRate: 25.0,
    estimatedDays: "7-10 business days",
  },
  {
    name: "Asia Pacific",
    countries: ["LK", "AU", "NZ", "JP", "SG"],
    baseRate: 35.0,
    estimatedDays: "5-8 business days",
  },
]

export function getShippingRate(countryCode: string): ShippingZone {
  const normalizedCountry = countryCode.trim().toUpperCase()
  const zone = SHIPPING_ZONES.find((z) => z.countries.includes(normalizedCountry))
  
  // Return standard international fallback zone if not found
  return zone || {
    name: "International Standard Delivery",
    countries: [],
    baseRate: 45.0,
    estimatedDays: "10-14 business days",
  }
}
