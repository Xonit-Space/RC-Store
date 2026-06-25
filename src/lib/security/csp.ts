/**
 * Builds a per-request Content-Security-Policy header for Next.js App Router.
 * Nonce is extracted from this header by Next.js during SSR and applied to framework scripts.
 */
export function buildContentSecurityPolicy(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development"

  const directives = [
    "default-src 'self'",
    // nonce + 'self': Next.js applies the nonce to framework scripts during SSR.
    // Avoid strict-dynamic so same-origin /_next/static scripts still load on fallback error pages.
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""}`,
    // Tailwind, Radix, and next/font rely on inline styles; unsafe-inline is standard for style-src.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "media-src 'self' blob:",
    "connect-src 'self' ws: wss:",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ]

  return directives.join("; ")
}

export function generateCspNonce(): string {
  const uuid = crypto.randomUUID()
  // Edge middleware has no Node Buffer — use btoa on the UTF-8 bytes.
  if (typeof btoa === "function") {
    return btoa(uuid)
  }
  return Buffer.from(uuid).toString("base64")
}
