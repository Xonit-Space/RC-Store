import { useEffect, useState } from "react"
import { useCurrencyStore, BASE_CURRENCY } from "@/store/currency"

export function usePrice() {
  const storeCurrency = useCurrencyStore((state) => state.activeCurrency)
  
  // To avoid hydration mismatch errors on SSR, we start with the base currency
  // and only use the stored currency after the component has mounted on the client.
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatPrice = (amountInAud: number) => {
    // If we haven't mounted yet, we format using AUD to match SSR output
    const currency = isMounted ? storeCurrency : BASE_CURRENCY
    const convertedAmount = amountInAud * currency.exchangeRate

    // Format the number based on the currency code, or fall back to just adding the symbol manually
    try {
      return convertedAmount.toLocaleString(undefined, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2,
      })
    } catch (e) {
      // Fallback if locale string fails for some reason
      return `${currency.symbol}${convertedAmount.toFixed(2)}`
    }
  }

  return { formatPrice, activeCurrency: isMounted ? storeCurrency : BASE_CURRENCY, isHydrated: isMounted }
}
