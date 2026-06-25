import { validateEnvironment } from "@/lib/env-validation"
import { bootstrapBackendSystems } from "@/lib/bootstrap"

export async function setupNodeInstrumentation(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    validateEnvironment()
  }

  await bootstrapBackendSystems()
}
