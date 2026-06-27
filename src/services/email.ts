import { Resend } from "resend"
import { render } from "@react-email/render"
import * as React from "react"
import { OrderConfirmationEmail } from "@/components/emails/OrderConfirmationEmail"
import { OrderShippedEmail } from "@/components/emails/OrderShippedEmail"
import { AbandonedCartEmail } from "@/components/emails/AbandonedCartEmail"

const resendApiKey = process.env.RESEND_API_KEY
let resend: Resend | null = null

// Initialize Resend client if API key is defined
if (resendApiKey) {
  resend = new Resend(resendApiKey)
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions) {
  if (!resend) {
    console.warn(
      `Resend API is not configured. Simulating email log:\n` +
      `To: ${options.to}\n` +
      `Subject: ${options.subject}\n` +
      `Content Preview: ${options.html.substring(0, 150)}...\n`
    )
    return { id: "simulated_id_2026", success: true }
  }

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "RC Store <noreply@rcstore.com>",
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    return { success: true, data }
  } catch (error) {
    console.error("Resend Email sending failed:", error)
    return { success: false, error }
  }
}

// ==========================================
// TRANSACTIONAL EMAILS TEMPLATES
// ==========================================

export async function sendWelcomeEmail(to: string, name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #1C1C1A; text-align: center;">Welcome to RC Store</h2>
      <p>Hello ${name},</p>
      <p>Thank you for creating an account with RC Store—the next generation of fashion streetwear.</p>
      <p>We are thrilled to accompany you on your fashion journey. Discover limited-edition drops and explore collections curated specifically for you.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${baseUrl}/shop" style="background-color: #1C1C1A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore Collections</a>
      </div>
      <p>Best regards,<br>The RC Store Team</p>
    </div>
  `
  return sendEmail({ to, subject: "Welcome to RC Store", html })
}

export async function sendVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
  const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}`

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #1C1C1A; text-align: center;">Verify Your Account</h2>
      <p>Please confirm your email address to complete your registration at RC Store.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #1C1C1A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
      </div>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The RC Store Team</p>
    </div>
  `
  return sendEmail({ to, subject: "Verify your email address", html })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #1C1C1A; text-align: center;">Reset Your Password</h2>
      <p>We received a request to reset your password for your RC Store account.</p>
      <p>If you didn't make this request, you can safely ignore this email.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #1C1C1A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>
      <p>This link will expire in 15 minutes.</p>
      <p>Best regards,<br>The RC Store Team</p>
    </div>
  `
  return sendEmail({ to, subject: "Reset your password", html })
}

// React Email Implementations

export async function sendOrderConfirmation(data: {
  email: string;
  orderNumber: string;
  customerName: string;
  items: any[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: string;
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
  );

  return sendEmail({
    to: data.email,
    subject: `Order Confirmation #${data.orderNumber}`,
    html,
  });
}

export async function sendOrderShippedEmail(data: {
  email: string;
  orderNumber: string;
  customerName: string;
  trackingNumber?: string;
}) {
  const html = await render(
    React.createElement(OrderShippedEmail, {
      orderNumber: data.orderNumber,
      customerName: data.customerName || "Customer",
      trackingNumber: data.trackingNumber,
    })
  );

  return sendEmail({
    to: data.email,
    subject: `Your order #${data.orderNumber} has shipped!`,
    html,
  });
}

export async function sendAbandonedCartRecovery(data: {
  email: string;
  customerName: string;
  items: any[];
  checkoutUrl: string;
}) {
  const html = await render(
    React.createElement(AbandonedCartEmail, {
      customerName: data.customerName || "Customer",
      items: data.items,
      checkoutUrl: data.checkoutUrl,
    })
  );

  return sendEmail({
    to: data.email,
    subject: `Did you forget something in your bag?`,
    html,
  });
}
