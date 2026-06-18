"use client"

import { useReportWebVitals } from "next/web-vitals"

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Phase 15: Log Core Web Vitals to console in development, or transmit to analytics
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        id: metric.id,
        label: metric.label,
        rating: metric.value > (metric.name === "LCP" ? 2500 : metric.name === "FID" ? 100 : metric.name === "CLS" ? 0.1 : metric.name === "TTFB" ? 800 : metric.name === "INP" ? 200 : 100) ? "poor" : "good",
      })
    }
    
    // In production, we can send this data to an API endpoint like /api/vitals
    // to store in our database or Sentry/Vercel Analytics.
    if (process.env.NODE_ENV === "production") {
      const body = JSON.stringify(metric)
      // Use sendBeacon if available, otherwise standard fetch
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/vitals", body)
      } else {
        fetch("/api/vitals", { body, method: "POST", keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {})
      }
    }
  })

  return null
}
