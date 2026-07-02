import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import * as React from "react"
import { OrderStatus } from "@prisma/client"
import { OrderConfirmationEmail } from "@/components/emails/OrderConfirmationEmail"
import { OrderShippedEmail } from "@/components/emails/OrderShippedEmail"
import { OrderStatusEmail } from "@/components/emails/OrderStatusEmail"
import { AbandonedCartEmail } from "@/components/emails/AbandonedCartEmail"
import { logger } from "@/lib/logger"

// ─── Transport (Brevo SMTP) ───────────────────────────────────────────────────

const SMTP_CONFIGURED =
  !!process.env.SMTP_HOST &&
  !!process.env.SMTP_USERNAME &&
  !!process.env.SMTP_PASSWORD

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (!SMTP_CONFIGURED) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false, // STARTTLS
      auth: {
        user: process.env.SMTP_USERNAME!,
        pass: process.env.SMTP_PASSWORD!,
      },
      tls: {
        ciphers: "SSLv3",
      },
    })
  }
  return transporter
}

// ─── Core sendEmail ───────────────────────────────────────────────────────────

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: unknown }> {
  const transport = getTransporter()

  if (!transport) {
    // No SMTP configured — log and simulate (safe for local dev without credentials)
    logger.warn(
      `[Email] SMTP not configured. Simulating email:\n` +
      `  To: ${options.to}\n` +
      `  Subject: ${options.subject}\n` +
      `  Preview: ${options.html.substring(0, 100)}...`
    )
    return { success: true, id: "simulated_dev" }
  }

  try {
    const info = await transport.sendMail({
      from: `"RC Store" <${process.env.SMTP_FROM_EMAIL ?? "info@aussierigsarena.com.au"}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    logger.info(`[Email] Delivered to ${options.to} | msgId: ${info.messageId}`)
    return { success: true, id: info.messageId }
  } catch (error) {
    logger.error({ message: "[Email] Brevo SMTP send failed", error })
    return { success: false, error }
  }
}

// ─── Auth Transactional Emails ───────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:8px;">
      <h2 style="color:#1C1C1A;text-align:center;">Welcome to RC Store</h2>
      <p>Hello ${name},</p>
      <p>Thank you for creating an account with RC Store — Australia's home for RC gear.</p>
      <p>Discover the latest models, parts, and accessories, curated just for you.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${baseUrl}/shop" style="background-color:#1C1C1A;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
          Explore Collections
        </a>
      </div>
      <p>Best regards,<br>The RC Store Team</p>
    </div>
  `
  return sendEmail({ to, subject: "Welcome to RC Store", html })
}

export async function sendVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}`
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:8px;">
      <h2 style="color:#1C1C1A;text-align:center;">Verify Your Account</h2>
      <p>Please confirm your email address to complete your RC Store registration.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${verificationUrl}" style="background-color:#1C1C1A;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
          Verify Email
        </a>
      </div>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The RC Store Team</p>
    </div>
  `
  return sendEmail({ to, subject: "Verify your email address", html })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const resetUrl = `${baseUrl}/reset-password?token=${token}`
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:8px;">
      <h2 style="color:#1C1C1A;text-align:center;">Reset Your Password</h2>
      <p>We received a request to reset your RC Store password. If you didn't make this request, you can ignore this email.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${resetUrl}" style="background-color:#1C1C1A;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
          Reset Password
        </a>
      </div>
      <p>This link will expire in 15 minutes.</p>
      <p>Best regards,<br>The RC Store Team</p>
    </div>
  `
  return sendEmail({ to, subject: "Reset your password", html })
}

// ─── Order Transactional Emails (React Email templates) ──────────────────────

export async function sendOrderConfirmation(data: {
  email: string
  orderNumber: string
  customerName: string
  items: { id: string; name: string; quantity: number; price: number; image?: string }[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress: string
}) {
  const html = await render(
    React.createElement(OrderConfirmationEmail, {
      orderNumber: data.orderNumber,
      customerName: data.customerName || "Customer",
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      shipping: data.shipping,
      total: data.total,
      shippingAddress: data.shippingAddress,
    })
  )
  return sendEmail({
    to: data.email,
    subject: `Order Confirmed #${data.orderNumber} — RC Store`,
    html,
  })
}

export async function sendOrderShippedEmail(data: {
  email: string
  orderNumber: string
  customerName: string
  trackingNumber?: string
  trackingUrl?: string
}) {
  const html = await render(
    React.createElement(OrderShippedEmail, {
      orderNumber: data.orderNumber,
      customerName: data.customerName || "Customer",
      trackingNumber: data.trackingNumber,
      trackingUrl: data.trackingUrl,
    })
  )
  return sendEmail({
    to: data.email,
    subject: `Your order #${data.orderNumber} has shipped! 🚚`,
    html,
  })
}

/**
 * Generic status-change email: PROCESSING, DELIVERED, CANCELLED, REFUNDED
 */
export async function sendOrderStatusEmail(data: {
  email: string
  orderNumber: string
  customerName: string
  status: OrderStatus
  trackingNumber?: string
  refundAmount?: number
}) {
  const html = await render(
    React.createElement(OrderStatusEmail, {
      orderNumber: data.orderNumber,
      customerName: data.customerName || "Customer",
      status: data.status,
      trackingNumber: data.trackingNumber,
      refundAmount: data.refundAmount,
    })
  )

  const subjectMap: Partial<Record<OrderStatus, string>> = {
    PROCESSING: `Your order #${data.orderNumber} is being prepared ⚙️`,
    DELIVERED: `Your order #${data.orderNumber} has been delivered! 🎉`,
    CANCELLED: `Your order #${data.orderNumber} has been cancelled`,
    REFUNDED: `Refund issued for order #${data.orderNumber} 💳`,
  }

  return sendEmail({
    to: data.email,
    subject: subjectMap[data.status] ?? `Order #${data.orderNumber} update — RC Store`,
    html,
  })
}

export async function sendAbandonedCartRecovery(data: {
  email: string
  customerName: string
  items: { id: string; name: string; image?: string; price: number }[]
  checkoutUrl: string
}) {
  const html = await render(
    React.createElement(AbandonedCartEmail, {
      customerName: data.customerName || "Customer",
      items: data.items,
      checkoutUrl: data.checkoutUrl,
    })
  )
  return sendEmail({
    to: data.email,
    subject: `Did you forget something in your bag? 🛒`,
    html,
  })
}
