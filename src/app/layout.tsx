import type React from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { Plus_Jakarta_Sans, Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LoadingProvider } from "@/components/providers/loading-provider"
import { SessionProvider } from "@/providers/session-provider"
import { QueryProvider } from "@/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { HeaderSkeleton } from "@/components/ui/loading-skeleton"
import { WebVitals } from "@/components/performance/web-vitals"
import { ClientLayoutWrapper } from "@/components/layout/client-layout-wrapper"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const outfit = Outfit({ 
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"], 
  variable: "--font-heading",
  display: "swap"
})

export const metadata: Metadata = {
  title: "AUSSIE RIGS ARENA | Racing Control",
  description: "Ultra-Premium RC Cars & Remote Racing Experience Platform"
}

// Nonces are per-request; pages using CSP must be dynamically rendered.
export const dynamic = "force-dynamic"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = headers().get("x-nonce") ?? undefined

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground selection:bg-racing-yellow selection:text-white`}>
        <WebVitals />
        <SessionProvider>
          <QueryProvider>
            {/* Allow system theme default for racing UI */}
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              nonce={nonce}
            >
              <LoadingProvider>
                <Suspense fallback={<HeaderSkeleton />}>
                  <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
                </Suspense>
                <Toaster />
              </LoadingProvider>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
