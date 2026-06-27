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

interface OrderShippedEmailProps {
  orderNumber: string;
  customerName: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export const OrderShippedEmail = ({
  orderNumber,
  customerName,
  trackingNumber = "RC-TRACK-12345",
  trackingUrl = "https://example.com/track",
}: OrderShippedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your RC Store Order #{orderNumber} has shipped!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your order is on the way!</Heading>
          <Text style={text}>
            Hi {customerName},
          </Text>
          <Text style={text}>
            Great news! Your order #{orderNumber} has been packed and handed over to our shipping partner.
          </Text>
          
          <Section style={trackingSection}>
            <Text style={trackingLabel}>Tracking Number:</Text>
            <Text style={trackingNumberText}>{trackingNumber}</Text>
            
            <Button style={{...btn, padding: "12px 20px"}} href={trackingUrl}>
              Track Package
            </Button>
          </Section>

          <Hr style={hr} />
          
          <Text style={footer}>
            If you have any questions, reply to this email or contact us at support@rcstore.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderShippedEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  padding: "0 48px",
  margin: "40px 0",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  padding: "0 48px",
};

const trackingSection = {
  padding: "32px 48px",
  backgroundColor: "#f6f9fc",
  margin: "20px 0",
  textAlign: "center" as const,
};

const trackingLabel = {
  fontSize: "14px",
  color: "#525f7f",
  margin: "0 0 8px 0",
  textTransform: "uppercase" as const,
  fontWeight: "bold",
};

const trackingNumberText = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#333",
  margin: "0 0 24px 0",
  letterSpacing: "2px",
};

const btn = {
  backgroundColor: "#000000",
  borderRadius: "4px",
  color: "#fff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
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
