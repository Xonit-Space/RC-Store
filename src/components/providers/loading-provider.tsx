"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { PageLoader } from "@/components/ui/loading-spinner"

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  withLoading: <T>(promise: Promise<T>) => Promise<T>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const withLoading = async <T,>(promise: Promise<T>): Promise<T> => {
    setLoading(true)
    try {
      const result = await promise
      return result
    } finally {
      setLoading(false)
    }
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, withLoading }}>
      {children}
      {isLoading && <PageLoader />}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}
