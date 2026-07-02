import { sendEmail } from "@/services/email"
import { logger } from "@/lib/logger"

export interface EmailJobData {
  to: string
  subject: string
  html: string
}

/**
 * Sends a transactional email via the configured Brevo SMTP transport.
 * Used by the BullMQ email worker for queued delivery.
 */
export async function sendEmailJob(data: EmailJobData): Promise<{ delivered: boolean; timestamp: number }> {
  const { to, subject, html } = data
  logger.info(`[EmailJob] Dispatching queued email to ${to} (Subject: ${subject})`)

  const result = await sendEmail({ to, subject, html })

  if (!result.success) {
    logger.error({ message: `[EmailJob] Failed to deliver email to ${to}`, error: result.error })
    throw new Error(`Email delivery failed for ${to}`)
  }

  return { delivered: true, timestamp: Date.now() }
}
