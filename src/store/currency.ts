import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CurrencyConfig {
  code: string;
  symbol: string;
  exchangeRate: number;
}

// Our base currency is AUD.
export const BASE_CURRENCY: CurrencyConfig = {
  code: "AUD",
  symbol: "$",
  exchangeRate: 1.0,
}

interface CurrencyState {
  activeCurrency: CurrencyConfig;
  setCurrency: (currency: CurrencyConfig) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      activeCurrency: BASE_CURRENCY,
      setCurrency: (currency) => set({ activeCurrency: currency }),
    }),
    {
      name: "currency-storage",
      skipHydration: true, // we handle hydration manually if needed, or just let Zustand handle it since we don't have complex hydration logic here, wait actually skipHydration is safer to prevent hydration mismatch
    }
  )
)
