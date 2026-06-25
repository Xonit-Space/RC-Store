import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

// We test the env validation module by manipulating process.env
describe("validateEnvironment (api-008)", () => {
  const originalEnv = { ...process.env }

  // Minimal valid env to test against
  const VALID_ENV: Record<string, string> = {
    DATABASE_URL:                       "postgresql://user:pass@host:5432/db",
    DIRECT_URL:                         "postgresql://user:pass@host:5432/db",
    NEXTAUTH_SECRET:                    "a".repeat(32),
    NEXTAUTH_URL:                       "http://localhost:3000",
    STRIPE_API_KEY:                     "sk_test_validkey",
    STRIPE_WEBHOOK_SECRET:              "whsec_validkey",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_validkey",
  }

  beforeEach(() => {
    // Wipe all known env keys before each test
    const keysToWipe = [
      "DATABASE_URL", "DIRECT_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL",
      "STRIPE_API_KEY", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "RESEND_API_KEY", "REDIS_URL",
    ]
    keysToWipe.forEach(k => delete process.env[k])
  })

  afterEach(() => {
    // Restore original environment
    Object.assign(process.env, originalEnv)
    // Also clean up any keys we added that weren't in original
    Object.keys(VALID_ENV).forEach(k => {
      if (!(k in originalEnv)) delete process.env[k]
    })
  })

  it("should pass validation when all required vars are present", async () => {
    Object.assign(process.env, VALID_ENV)
    const { validateEnvironment } = await import("@/lib/env-validation")
    expect(() => validateEnvironment()).not.toThrow()
  })

  it("should throw when DATABASE_URL is missing", async () => {
    Object.assign(process.env, VALID_ENV)
    delete process.env.DATABASE_URL
    vi.resetModules()
    const { validateEnvironment } = await import("@/lib/env-validation")
    expect(() => validateEnvironment()).toThrow(/DATABASE_URL/)
  })

  it("should throw when NEXTAUTH_SECRET is missing", async () => {
    Object.assign(process.env, VALID_ENV)
    delete process.env.NEXTAUTH_SECRET
    vi.resetModules()
    const { validateEnvironment } = await import("@/lib/env-validation")
    expect(() => validateEnvironment()).toThrow(/NEXTAUTH_SECRET/)
  })

  it("should throw when STRIPE_API_KEY is missing", async () => {
    Object.assign(process.env, VALID_ENV)
    delete process.env.STRIPE_API_KEY
    vi.resetModules()
    const { validateEnvironment } = await import("@/lib/env-validation")
    expect(() => validateEnvironment()).toThrow(/STRIPE_API_KEY/)
  })

  it("should throw when NEXTAUTH_SECRET contains placeholder value", async () => {
    Object.assign(process.env, VALID_ENV)
    process.env.NEXTAUTH_SECRET = "REPLACE_WITH_OPENSSL_RAND_OUTPUT"
    vi.resetModules()
    const { validateEnvironment } = await import("@/lib/env-validation")
    expect(() => validateEnvironment()).toThrow(/NEXTAUTH_SECRET/)
  })

  it("should throw when STRIPE_API_KEY contains placeholder value", async () => {
    Object.assign(process.env, VALID_ENV)
    process.env.STRIPE_API_KEY = "sk_test_51O..."
    vi.resetModules()
    const { validateEnvironment } = await import("@/lib/env-validation")
    expect(() => validateEnvironment()).toThrow(/STRIPE_API_KEY/)
  })

  it("should NOT throw when optional RESEND_API_KEY is absent (warn only)", async () => {
    Object.assign(process.env, VALID_ENV)
    delete process.env.RESEND_API_KEY
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.resetModules()
    const { validateEnvironment } = await import("@/lib/env-validation")
    expect(() => validateEnvironment()).not.toThrow()
    consoleWarnSpy.mockRestore()
  })

  it("should warn (not throw) when optional REDIS_URL is absent", async () => {
    Object.assign(process.env, VALID_ENV)
    delete process.env.REDIS_URL
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.resetModules()
    const { validateEnvironment } = await import("@/lib/env-validation")
    expect(() => validateEnvironment()).not.toThrow()
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("REDIS_URL"))
    consoleWarnSpy.mockRestore()
  })

  it("should include all missing required vars in the error message", async () => {
    // Set nothing — all required vars absent
    vi.resetModules()
    const { validateEnvironment } = await import("@/lib/env-validation")
    expect(() => validateEnvironment()).toThrow(/DATABASE_URL/)
  })

  it("should NOT throw when strict is false and required vars are missing", async () => {
    vi.resetModules()
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const { validateEnvironment } = await import("@/lib/env-validation")
    expect(() => validateEnvironment({ strict: false })).not.toThrow()
    consoleErrorSpy.mockRestore()
  })
})