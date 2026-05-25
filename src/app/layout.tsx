import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LoadingProvider } from "@/components/providers/loading-provider"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { HeaderSkeleton } from "@/components/ui/loading-skeleton"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NEOSHOP ULTRA - Smart E-Commerce Platform",
  description: "The most customizable and scalable e-commerce platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LoadingProvider>
            <Suspense fallback={<HeaderSkeleton />}>{children}</Suspense>
            <Toaster />
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
