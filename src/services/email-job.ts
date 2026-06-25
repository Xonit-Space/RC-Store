import { logger } from "@/lib/logger"

export interface EmailJobData {
  to: string
  subject: string
  html: string
}

/**
 * Sends (or simulates) a transactional email job.
 * Shared by BullMQ workers and serverless inline dispatch.
 */
export async function sendEmailJob(data: EmailJobData): Promise<{ delivered: boolean; timestamp: number }> {
  const { to, subject, html } = data
  logger.info(`[EmailJob] Sending email to ${to} (Subject: ${subject})`)

  // TODO: integrate Resend when RESEND_API_KEY is configured
  void html

  await new Promise((resolve) => setTimeout(resolve, 500))

  return { delivered: true, timestamp: Date.now() }
}
