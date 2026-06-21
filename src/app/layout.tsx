import type React from "react"
import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
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
const orbitron = Orbitron({ 
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"], 
  variable: "--font-orbitron",
  display: "swap"
})

export const metadata: Metadata = {
  title: "NEOSHOP ULTRA | Racing Control",
  description: "Ultra-Premium RC Cars & Remote Racing Experience Platform"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${orbitron.variable} font-sans antialiased bg-background text-foreground selection:bg-racing-red selection:text-white`}>
        <WebVitals />
        <SessionProvider>
          <QueryProvider>
            {/* Force dark theme default for racing UI */}
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
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
