import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

// Ensure we don't crash the server if twilio is not configured, just log warnings.
export const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null

export async function sendOrderConfirmationSms(to: string, orderNumber: string, totalAmount: number): Promise<boolean> {
  if (!twilioClient || !twilioPhoneNumber) {
    console.warn("[Twilio] SMS service is not configured. Skipping SMS.")
    return false
  }

  try {
    await twilioClient.messages.create({
      body: `Hi there! Your order #${orderNumber} for $${totalAmount.toFixed(2)} has been successfully confirmed. Thank you for shopping with us!`,
      from: twilioPhoneNumber,
      to,
    })
    console.info(`[Twilio] Order confirmation SMS sent to ${to} for order ${orderNumber}`)
    return true
  } catch (error) {
    console.error(`[Twilio] Failed to send order confirmation SMS:`, error)
    return false
  }
}

export async function sendOrderStatusUpdateSms(to: string, orderNumber: string, status: string): Promise<boolean> {
  if (!twilioClient || !twilioPhoneNumber) {
    console.warn("[Twilio] SMS service is not configured. Skipping SMS.")
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
    console.info(`[Twilio] Order status update SMS sent to ${to} for order ${orderNumber}`)
    return true
  } catch (error) {
    console.error(`[Twilio] Failed to send order status update SMS:`, error)
    return false
  }
}
