"use client"

import { useEffect, useState, useCallback } from "react"
import { useCurrencyStore } from "@/store/currency"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Globe, RefreshCw } from "lucide-react"

interface LiveCurrency {
  code: string
  symbol: string
  name: string
  exchangeRate: number
}

// Refetch rates every 5 minutes while the tab is open
const REFRESH_INTERVAL_MS = 5 * 60 * 1000

export function CurrencySwitcher() {
  const { activeCurrency, setCurrency } = useCurrencyStore()
  const [currencies, setCurrencies] = useState<LiveCurrency[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchRates = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true)
    try {
      const res = await fetch("/api/currencies/rates", {
        // Tell the browser to use stale cache while re-validating
        next: { revalidate: 300 },
      } as RequestInit)
      if (!res.ok) throw new Error("Non-200 response")
      const json = await res.json()
      const fetched: LiveCurrency[] = json.currencies || []
      if (fetched.length > 0) {
        setCurrencies(fetched)

        // Keep the active currency's exchange rate up to date silently
        const updated = fetched.find(c => c.code === activeCurrency.code)
        if (updated && updated.exchangeRate !== activeCurrency.exchangeRate) {
          setCurrency({ ...activeCurrency, exchangeRate: updated.exchangeRate })
        }
      }
    } catch {
      // Ignore — the API route already falls back to stale/hardcoded rates
    } finally {
      setIsRefreshing(false)
    }
  }, [activeCurrency, setCurrency])

  useEffect(() => {
    useCurrencyStore.persist.rehydrate()
    setIsHydrated(true)
    fetchRates(true) // silent initial load

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchRates(true), REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Don't render during SSR or if we have no currencies yet
  if (!isHydrated || currencies.length < 2) return null

  const handleCurrencyChange = (code: string) => {
    const selected = currencies.find(c => c.code === code)
    if (selected) {
      setCurrency({
        code: selected.code,
        symbol: selected.symbol,
        exchangeRate: selected.exchangeRate,
      })
    }
  }

  return (
    <div className="hidden md:flex items-center gap-1">
      <Select value={activeCurrency.code} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-[100px] h-9 border-border/40 bg-background/50 backdrop-blur-sm text-xs font-bold uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5 mr-1.5 opacity-50 shrink-0" />
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent className="max-h-[280px] overflow-y-auto">
          {currencies.map((currency) => (
            <SelectItem
              key={currency.code}
              value={currency.code}
              className="text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              <span className="font-bold mr-1.5">{currency.symbol}</span>
              <span className="text-muted-foreground">{currency.code}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Subtle refresh indicator */}
      {isRefreshing && (
        <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />
      )}
    </div>
  )
}
