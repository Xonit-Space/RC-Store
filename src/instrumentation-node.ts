import { validateEnvironment } from "@/lib/env-validation"
import { bootstrapBackendSystems } from "@/lib/bootstrap"
import { logger } from "@/lib/logger"

export async function setupNodeInstrumentation(): Promise<void> {
  try {
    if (process.env.NODE_ENV === "production") {
      // Never crash the web server on missing optional integrations (Stripe, etc.).
      validateEnvironment({ strict: false })
    }

    await bootstrapBackendSystems()
  } catch (err) {
    logger.error({
      message: "[Instrumentation] Startup initialization failed — app will run in degraded mode",
      error: err,
    })
  }
}
