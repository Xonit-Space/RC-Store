import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { OrderStatus } from "@prisma/client";

interface OrderStatusEmailProps {
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  trackingNumber?: string;
  refundAmount?: number;
}

const STATUS_CONFIG: Record<
  string,
  { subject: string; headline: string; body: string; accent: string; emoji: string }
> = {
  PROCESSING: {
    subject: "We're preparing your order",
    headline: "Your order is being prepared",
    body: "Great news! We've started processing your order and our team is carefully picking and packing your items.",
    accent: "#f59e0b",
    emoji: "⚙️",
  },
  DELIVERED: {
    subject: "Your order has been delivered!",
    headline: "Package delivered!",
    body: "Your order has been marked as delivered. We hope you love your purchase! If you have any issues, please reach out to our support team.",
    accent: "#10b981",
    emoji: "🎉",
  },
  CANCELLED: {
    subject: "Your order has been cancelled",
    headline: "Order cancelled",
    body: "Your order has been cancelled. If you did not request this cancellation or have any questions, please contact our support team immediately.",
    accent: "#ef4444",
    emoji: "❌",
  },
  REFUNDED: {
    subject: "Your refund has been issued",
    headline: "Refund processed",
    body: "Good news — your refund has been successfully issued. Please allow 5–10 business days for the funds to appear in your account, depending on your bank.",
    accent: "#6366f1",
    emoji: "💳",
  },
};

export const OrderStatusEmail = ({
  orderNumber,
  customerName,
  status,
  trackingNumber,
  refundAmount,
}: OrderStatusEmailProps) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["PROCESSING"];
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://aussierigsarena.com.au";

  return (
    <Html>
      <Head />
      <Preview>
        {config.emoji} {config.subject} — Order #{orderNumber}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Status Badge */}
          <Section style={{ ...statusBadge, backgroundColor: config.accent }}>
            <Text style={statusBadgeText}>
              {config.emoji} ORDER {status}
            </Text>
          </Section>

          <Heading style={h1}>{config.headline}</Heading>

          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>{config.body}</Text>

          {/* Order Number Block */}
          <Section style={orderBlock}>
            <Text style={orderLabel}>Order Reference</Text>
            <Text style={orderNumber_style}>#{orderNumber}</Text>
          </Section>

          {/* Tracking number (if shipped or delivered) */}
          {trackingNumber && (
            <Section style={infoBlock}>
              <Text style={infoLabel}>Tracking Number</Text>
              <Text style={infoValue}>{trackingNumber}</Text>
            </Section>
          )}

          {/* Refund amount (if refunded) */}
          {refundAmount !== undefined && refundAmount > 0 && (
            <Section style={infoBlock}>
              <Text style={infoLabel}>Refund Amount</Text>
              <Text style={infoValue}>
                {refundAmount.toLocaleString("en-AU", {
                  style: "currency",
                  currency: "AUD",
                })}
              </Text>
            </Section>
          )}

          <Section style={btnContainer}>
            <Button
              style={{ ...btn, backgroundColor: config.accent, padding: "14px 28px" }}
              href={`${baseUrl}/orders`}
            >
              View Order Details
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Questions? Contact us at{" "}
            <a href="mailto:info@aussierigsarena.com.au" style={link}>
              info@aussierigsarena.com.au
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderStatusEmail;

// ── Styles ─────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const statusBadge = {
  padding: "16px 48px",
  textAlign: "center" as const,
};

const statusBadgeText = {
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "bold",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  margin: "0",
};

const h1 = {
  color: "#1a1a2e",
  fontSize: "24px",
  fontWeight: "bold",
  padding: "0 48px",
  margin: "32px 0 8px",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 48px",
  margin: "8px 0",
};

const orderBlock = {
  padding: "20px 48px",
  backgroundColor: "#f6f9fc",
  margin: "24px 0",
  textAlign: "center" as const,
};

const orderLabel = {
  fontSize: "12px",
  color: "#8898aa",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 6px",
};

const orderNumber_style = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#1a1a2e",
  margin: "0",
  letterSpacing: "1px",
};

const infoBlock = {
  padding: "12px 48px",
  margin: "0",
  borderLeft: "4px solid #e6ebf1",
  marginLeft: "48px",
  marginBottom: "16px",
};

const infoLabel = {
  fontSize: "12px",
  color: "#8898aa",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 4px",
};

const infoValue = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#333",
  margin: "0",
};

const btnContainer = {
  textAlign: "center" as const,
  padding: "24px 48px",
};

const btn = {
  borderRadius: "6px",
  color: "#fff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  fontWeight: "bold",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 48px",
};

const link = {
  color: "#6366f1",
};
