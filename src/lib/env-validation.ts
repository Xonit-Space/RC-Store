/**
 * Environment Variable Validation
 *
 * Called once at server startup. Logs warnings for missing optional vars
 * and throws for missing critical vars that would cause silent failures.
 *
 * This prevents "works in dev, silent failure in prod" scenarios.
 */

interface EnvSpec {
  key: string
  required: boolean
  description: string
  redact?: boolean
}

const ENV_SPEC: EnvSpec[] = [
  // Critical — app cannot function without these
  { key: "DATABASE_URL",                     required: true,  description: "Prisma database connection URL" },
  { key: "DIRECT_URL",                       required: true,  description: "Prisma direct connection URL (for migrations)" },
  { key: "NEXTAUTH_SECRET",                  required: true,  description: "NextAuth.js JWT signing secret (openssl rand -base64 32)", redact: true },
  { key: "NEXTAUTH_URL",                     required: true,  description: "Canonical application base URL" },
  { key: "STRIPE_API_KEY",                   required: true,  description: "Stripe secret API key", redact: true },
  { key: "STRIPE_WEBHOOK_SECRET",            required: true,  description: "Stripe webhook signing secret", redact: true },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", required: true, description: "Stripe publishable key" },

  // High importance — core features silently degrade without these
  { key: "RESEND_API_KEY",                   required: false, description: "Resend transactional email API key (order confirmations, password reset)", redact: true },
  { key: "REDIS_URL",                        required: false, description: "Redis connection URL (rate limiting, caching, BullMQ queues)", redact: true },
  { key: "NEXT_PUBLIC_BASE_URL",             required: false, description: "Public base URL used in email links — defaults to NEXTAUTH_URL" },

  // Optional integrations
  { key: "CLOUDINARY_API_KEY",               required: false, description: "Cloudinary image upload API key", redact: true },
  { key: "CLOUDINARY_API_SECRET",            required: false, description: "Cloudinary image upload API secret", redact: true },
  { key: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",required: false, description: "Cloudinary cloud name" },
  { key: "TWILIO_ACCOUNT_SID",               required: false, description: "Twilio SMS account SID", redact: true },
  { key: "TWILIO_AUTH_TOKEN",                required: false, description: "Twilio SMS auth token", redact: true },
  { key: "TWILIO_PHONE_NUMBER",              required: false, description: "Twilio outbound phone number" },
  { key: "OPENAI_API_KEY",                   required: false, description: "OpenAI API key for AI styling advisor", redact: true },
]

export function validateEnvironment(): void {
  const errors: string[] = []
  const warnings: string[] = []

  for (const spec of ENV_SPEC) {
    const value = process.env[spec.key]
    const display = spec.redact ? "[REDACTED]" : (value?.substring(0, 20) ?? "")

    if (!value || value.trim() === "") {
      if (spec.required) {
        errors.push(`  ❌ MISSING [REQUIRED] ${spec.key} — ${spec.description}`)
      } else {
        warnings.push(`  ⚠️  MISSING [OPTIONAL] ${spec.key} — ${spec.description}`)
      }
    } else {
      // Detect placeholder values that were never replaced
      const placeholders = ["your_", "REPLACE_WITH", "sk_test_51O...", "pk_test_51O...", "whsec_..."]
      if (placeholders.some(p => value.includes(p))) {
        if (spec.required) {
          errors.push(`  ❌ PLACEHOLDER [REQUIRED] ${spec.key} — still contains template value: "${display}"`)
        } else {
          warnings.push(`  ⚠️  PLACEHOLDER [OPTIONAL] ${spec.key} — still contains template value`)
        }
      }
    }
  }

  if (warnings.length > 0) {
    console.warn("\n[ENV] Optional environment variables not configured:")
    warnings.forEach(w => console.warn(w))
    console.warn("  → These integrations will run in degraded/simulation mode.\n")
  }

  if (errors.length > 0) {
    const message = [
      "\n[ENV] CRITICAL: Required environment variables are missing or contain placeholders:",
      ...errors,
      "\n  → Copy .env.example to .env.local and fill in the required values.",
      "  → See .env.example for documentation on each variable.\n",
    ].join("\n")

    throw new Error(message)
  }
}
