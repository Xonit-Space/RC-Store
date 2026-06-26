import twilio from "twilio"
import { logger } from "@/lib/logger"

// Standard E.164 phone number regex (starts with +, up to 15 digits)
const E164_REGEX = /^\+[1-9]\d{1,14}$/

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

// Ensure we don't crash the server if twilio is not configured, just log warnings.
export const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null

export async function sendOrderConfirmationSms(to: string, orderNumber: string, totalAmount: number): Promise<boolean> {
  if (!twilioClient || !twilioPhoneNumber) {
    logger.warn("[Twilio] SMS service is not configured. Skipping SMS.")
    return false
  }

  // E.164 format validation
  if (!E164_REGEX.test(to)) {
    logger.error(`[Twilio] Invalid phone number format for order ${orderNumber}. Must be E.164 (e.g. +1234567890). Got: ${to}`)
    return false
  }

  try {
    await twilioClient.messages.create({
      body: `Hi there! Your order #${orderNumber} for $${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} has been successfully confirmed. Thank you for shopping with us!`,
      from: twilioPhoneNumber,
      to,
    })
    logger.info(`[Twilio] Order confirmation SMS sent to ${to} for order ${orderNumber}`)
    return true
  } catch (error) {
    logger.error({ message: "[Twilio] Failed to send order confirmation SMS:", error })
    return false
  }
}

export async function sendOrderStatusUpdateSms(to: string, orderNumber: string, status: string): Promise<boolean> {
  if (!twilioClient || !twilioPhoneNumber) {
    logger.warn("[Twilio] SMS service is not configured. Skipping SMS.")
    return false
  }

  // E.164 format validation
  if (!E164_REGEX.test(to)) {
    logger.error(`[Twilio] Invalid phone number format for order ${orderNumber} status update. Must be E.164. Got: ${to}`)
    return false
  }

  let message = `Your order #${orderNumber} status has been updated to: ${status}.`
  if (status === "SHIPPED") {
    message = `Good news! Your order #${orderNumber} has been shipped. We will notify you once it's out for delivery.`
  } else if (status === "DELIVERED") {
    message = `Your order #${orderNumber} has been delivered. Enjoy your purchase!`
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to,
    })
    logger.info(`[Twilio] Order status update SMS sent to ${to} for order ${orderNumber}`)
    return true
  } catch (error) {
    logger.error({ message: "[Twilio] Failed to send order status update SMS:", error })
    return false
  }
}
