import { Resend } from "resend"

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
    return { id: "simulated_id_2026" }
  }

  try {
    const data = await resend.emails.send({
      from: "RC Store <noreply@aussierigsarena.com>",
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    return data
  } catch (error) {
    console.error("Resend Email sending failed:", error)
    throw new Error("Failed to send transactional email")
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

export async function sendOrderConfirmation(to: string, orderNumber: string, total: number) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #10b981; text-align: center;">Order Confirmed!</h2>
      <p>Thank you for your purchase.</p>
      <p>We have successfully received your payment for order <strong>#${orderNumber}</strong> and our team is prepping it for shipment.</p>
      <div style="background-color: #F6F3EE; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #4b5563;">Order Total:</p>
        <h3 style="margin: 5px 0 0 0; color: #1C1C1A;">$${total.toFixed(2)}</h3>
      </div>
      <p>We will email you a tracking code as soon as your premium streetwear is in transit.</p>
      <p>Best regards,<br>The RC Store Team</p>
    </div>
  `
  return sendEmail({ to, subject: `Order Confirmation #${orderNumber}`, html })
}

export async function sendAbandonedCartRecovery(to: string, name: string, checkoutUrl: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #1C1C1A; text-align: center;">We saved your cart!</h2>
      <p>Hello ${name},</p>
      <p>We noticed you left some designer streetwear items in your shopping bag. Don't let your favorites slip away—limited inventory is selling out quickly!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${checkoutUrl}" style="background-color: #1C1C1A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Checkout</a>
      </div>
      <p>Need assistance? Replying directly to this email hooks you up with our elite customer support agents.</p>
      <p>Best regards,<br>The RC Store Team</p>
    </div>
  `
  return sendEmail({ to, subject: "Don't forget your favorites!", html })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  // Use NEXT_PUBLIC_BASE_URL if available, else fallback to NEXTAUTH_URL or localhost
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
