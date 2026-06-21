"use client"

import { createContext, useContext, ReactNode } from "react"

const CustomerContext = createContext<any>(null)

export function CustomerProvider({ children, profile }: { children: ReactNode, profile: any }) {
  return (
    <CustomerContext.Provider value={{ profile }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  return useContext(CustomerContext)
}
