import { logger } from "@/lib/logger"

export interface AnalyticsJobData {
  event: string
  userId?: string
  productId?: string
  cartId?: string
  rating?: number
  payload?: unknown
}

/**
 * Processes an analytics tracking job inline or via BullMQ worker.
 */
export async function trackAnalyticsJob(data: AnalyticsJobData): Promise<{ processed: boolean; event: string }> {
  logger.info(`[AnalyticsJob] Processing event ${data.event} for user ${data.userId ?? "anonymous"}`)

  await new Promise((resolve) => setTimeout(resolve, 300))

  return { processed: true, event: data.event }
}
