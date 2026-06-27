"use client"

import { useEffect, useState } from "react"
import { useCurrencyStore } from "@/store/currency"
import { getActiveCurrencies } from "@/actions/currency"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Globe } from "lucide-react"

export function CurrencySwitcher() {
  const [currencies, setCurrencies] = useState<any[]>([])
  const { activeCurrency, setCurrency } = useCurrencyStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    useCurrencyStore.persist.rehydrate()
    setIsHydrated(true)
    getActiveCurrencies().then((data) => {
      setCurrencies(data)
    })
  }, [])

  if (!isHydrated || currencies.length === 0) {
    return <Skeleton className="h-9 w-24 rounded-md" />
  }

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
    <Select value={activeCurrency.code} onValueChange={handleCurrencyChange}>
      <SelectTrigger className="w-[110px] h-9 border-border/40 bg-background/50 backdrop-blur-sm text-xs font-bold uppercase tracking-wider hidden md:flex">
        <Globe className="w-3.5 h-3.5 mr-2 opacity-50" />
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem 
            key={currency.code} 
            value={currency.code}
            className="text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            {currency.symbol} {currency.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
