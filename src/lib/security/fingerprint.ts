import crypto from "crypto"
import { NextRequest } from "next/server"

/**
 * Generates a unique fingerprint for a client request.
 * Useful for rate limiting and abuse prevention tracking when users are unauthenticated.
 * 
 * Uses IP address and User-Agent headers to generate a deterministic hash.
 */
export function generateClientFingerprint(req: NextRequest): string {
  // Extract best-effort IP address
  const forwardedFor = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown-ip"

  // Extract User-Agent
  const userAgent = req.headers.get("user-agent") || "unknown-ua"

  // Create a SHA-256 hash of the combination
  const hash = crypto.createHash("sha256")
  hash.update(`${ip}-${userAgent}`)
  
  return hash.digest("hex")
}
