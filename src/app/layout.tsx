import type React from "react"
import type { Metadata } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LoadingProvider } from "@/components/providers/loading-provider"
import { SessionProvider } from "@/providers/session-provider"
import { QueryProvider } from "@/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { HeaderSkeleton } from "@/components/ui/loading-skeleton"
import { WebVitals } from "@/components/performance/web-vitals"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const cormorant = Cormorant_Garamond({ 
  weight: ["300", "400"],
  subsets: ["latin"], 
  variable: "--font-cormorant",
  display: "swap"
})

export const metadata: Metadata = {
  title: "NEOSHOP ULTRA - Smart E-Commerce Platform",
  description: "The most customizable and scalable e-commerce platform"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cormorant.variable} font-sans antialiased bg-background text-foreground selection:bg-brass/30 selection:text-forest`}>
        <WebVitals />
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <LoadingProvider>
                <Suspense fallback={<HeaderSkeleton />}>{children}</Suspense>
                <Toaster />
              </LoadingProvider>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
