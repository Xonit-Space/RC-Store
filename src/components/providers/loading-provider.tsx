"use client"

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react"
import { PageLoader } from "@/components/ui/loading-spinner"

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  withLoading: <T>(promise: Promise<T>) => Promise<T>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  // Phase 8: useCallback ensures these function references are stable across renders
  // This prevents React.memo'd consumers from re-rendering due to new function identity
  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  const withLoading = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    setIsLoading(true)
    try {
      const result = await promise
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Phase 8: useMemo prevents new object identity on every render, which would
  // cause every useLoading() consumer to re-render even when isLoading hasn't changed
  const value = useMemo(
    () => ({ isLoading, setLoading, withLoading }),
    [isLoading, setLoading, withLoading]
  )

  return (
    <LoadingContext.Provider value={value}>
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
