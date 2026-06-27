import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: string;
}

export const OrderConfirmationEmail = ({
  orderNumber,
  customerName,
  items,
  subtotal,
  tax,
  shipping,
  total,
  shippingAddress,
}: OrderConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your RC Store Order #{orderNumber} is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thank you for your order!</Heading>
          <Text style={text}>
            Hi {customerName},
          </Text>
          <Text style={text}>
            We&apos;ve received your order and are getting it ready to ship. We will notify you when it has been sent.
          </Text>
          
          <Section style={orderSection}>
            <Text style={orderNumberText}>Order #{orderNumber}</Text>
            
            {items.map((item) => (
              <Section key={item.id} style={itemRow}>
                {item.image && (
                  <Img
                    src={item.image}
                    width="60"
                    height="60"
                    alt={item.name}
                    style={itemImage}
                  />
                )}
                <div style={itemDetails}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemMeta}>Qty: {item.quantity}</Text>
                </div>
                <Text style={itemPrice}>${item.price.toFixed(2)}</Text>
              </Section>
            ))}

            <Hr style={hr} />

            <Section style={totalsSection}>
              <div style={totalsRow}>
                <Text style={totalsLabel}>Subtotal:</Text>
                <Text style={totalsValue}>${subtotal.toFixed(2)}</Text>
              </div>
              <div style={totalsRow}>
                <Text style={totalsLabel}>Tax:</Text>
                <Text style={totalsValue}>${tax.toFixed(2)}</Text>
              </div>
              <div style={totalsRow}>
                <Text style={totalsLabel}>Shipping:</Text>
                <Text style={totalsValue}>${shipping.toFixed(2)}</Text>
              </div>
              <Hr style={hrSmall} />
              <div style={totalsRow}>
                <Text style={totalsLabelBold}>Total:</Text>
                <Text style={totalsValueBold}>${total.toFixed(2)}</Text>
              </div>
            </Section>
          </Section>

          <Section style={shippingSection}>
            <Heading style={h2}>Shipping Address</Heading>
            <Text style={text}>{shippingAddress}</Text>
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

export default OrderConfirmationEmail;

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

const h2 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "20px 0 10px",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  padding: "0 48px",
};

const orderSection = {
  padding: "24px 48px",
  backgroundColor: "#f6f9fc",
  margin: "20px 0",
};

const orderNumberText = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px",
};

const itemRow = {
  display: "flex",
  marginBottom: "16px",
};

const itemImage = {
  borderRadius: "8px",
  marginRight: "16px",
};

const itemDetails = {
  flex: 1,
};

const itemName = {
  fontSize: "16px",
  color: "#333",
  margin: "0 0 4px 0",
};

const itemMeta = {
  fontSize: "14px",
  color: "#525f7f",
  margin: "0",
};

const itemPrice = {
  fontSize: "16px",
  color: "#333",
  fontWeight: "bold",
  margin: "0",
};

const totalsSection = {
  marginTop: "20px",
};

const totalsRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const totalsLabel = {
  fontSize: "16px",
  color: "#525f7f",
  margin: "0",
};

const totalsValue = {
  fontSize: "16px",
  color: "#333",
  margin: "0",
};

const totalsLabelBold = {
  ...totalsLabel,
  fontWeight: "bold",
  color: "#333",
};

const totalsValueBold = {
  ...totalsValue,
  fontWeight: "bold",
};

const shippingSection = {
  padding: "0 48px",
  marginTop: "20px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const hrSmall = {
  borderColor: "#e6ebf1",
  margin: "10px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 48px",
};
