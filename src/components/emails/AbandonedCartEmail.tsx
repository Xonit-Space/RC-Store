import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface CartItem {
  id: string;
  name: string;
  image?: string;
  price: number;
}

interface AbandonedCartEmailProps {
  customerName: string;
  items: CartItem[];
  checkoutUrl: string;
}

export const AbandonedCartEmail = ({
  customerName,
  items,
  checkoutUrl,
}: AbandonedCartEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You left something behind in your RC Store bag!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Did you forget something?</Heading>
          <Text style={text}>
            Hi {customerName},
          </Text>
          <Text style={text}>
            We noticed you left some great items in your shopping bag. They&apos;re selling fast, so we saved them for you.
          </Text>
          <Text style={text}>
            Use code <strong>COMEBACK5</strong> at checkout for 5% off your entire order!
          </Text>
          
          <Section style={orderSection}>
            {items.slice(0, 3).map((item) => (
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
                  <Text style={itemPrice}>${item.price.toFixed(2)}</Text>
                </div>
              </Section>
            ))}
            
            {items.length > 3 && (
              <Text style={moreItemsText}>
                + {items.length - 3} more item(s) in your bag
              </Text>
            )}

            <Section style={btnContainer}>
              <Button style={{...btn, padding: "14px 24px"}} href={checkoutUrl}>
                Complete Your Purchase
              </Button>
            </Section>
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

export default AbandonedCartEmail;

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

const orderSection = {
  padding: "32px 48px",
  backgroundColor: "#f6f9fc",
  margin: "20px 0",
};

const itemRow = {
  display: "flex",
  marginBottom: "16px",
  alignItems: "center" as const,
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
  fontWeight: "bold",
};

const itemPrice = {
  fontSize: "14px",
  color: "#525f7f",
  margin: "0",
};

const moreItemsText = {
  fontSize: "14px",
  color: "#525f7f",
  fontStyle: "italic",
  marginTop: "16px",
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
};

const btn = {
  backgroundColor: "#000000",
  borderRadius: "4px",
  color: "#fff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  fontSize: "16px",
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
