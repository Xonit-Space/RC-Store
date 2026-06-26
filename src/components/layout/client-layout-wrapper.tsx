"use client"

import { usePathname } from "next/navigation"
import { Header } from "./header"
import { Footer } from "./footer"

interface ClientLayoutWrapperProps {
  children: React.ReactNode
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname()
  
  // Do not render global header/footer on admin and login routes
  const isGlobalLayout = !pathname.startsWith("/admin") && !pathname.startsWith("/login") && !pathname.startsWith("/register")

  return (
    <>
      {isGlobalLayout && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {isGlobalLayout && <Footer />}
    </>
  )
}
