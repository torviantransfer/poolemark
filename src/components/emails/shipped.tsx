import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { baseUrl, styles } from "./shared";

interface ShippedEmailProps {
  firstName: string;
  orderNumber: string;
  orderId: string;
  cargoCompany: string;
  trackingNumber: string;
  trackingUrl?: string;
}

export function ShippedEmail({
  firstName,
  orderNumber,
  orderId,
  cargoCompany,
  trackingNumber,
  trackingUrl,
}: ShippedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Siparişiniz kargoya verildi — {orderNumber}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={baseUrl} style={styles.logo}>
              Poolemark
            </Link>
          </Section>
          <Section style={styles.content}>
            <Heading style={styles.heading}>
              Siparişiniz Kargoda! 🚚
            </Heading>
            <Text style={styles.text}>
              Merhaba {firstName}, <strong>{orderNumber}</strong> numaralı
              siparişin kargoya verildi.
            </Text>

            <Section
              style={{
                backgroundColor: "#F7F5F3",
                borderRadius: "10px",
                padding: "20px",
                marginTop: "16px",
              }}
            >
              <Text
                style={{
                  ...styles.text,
                  margin: "0 0 8px",
                  fontSize: "13px",
                }}
              >
                <strong>Kargo Firması:</strong> {cargoCompany}
              </Text>
              <Text
                style={{
                  ...styles.text,
                  margin: "0",
                  fontSize: "13px",
                  fontFamily: "monospace",
                }}
              >
                <strong>Takip No:</strong> {trackingNumber}
              </Text>
            </Section>

            {trackingUrl ? (
              <Link href={trackingUrl} style={{ ...styles.button, marginTop: "20px" }}>
                Kargo Takibi
              </Link>
            ) : (
              <Link
                href={`${baseUrl}/hesabim/siparislerim/${orderId}`}
                style={{ ...styles.button, marginTop: "20px" }}
              >
                Siparişi Görüntüle
              </Link>
            )}
          </Section>
          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Poolemark. Tüm hakları saklıdır.
              <br />
              <Link href={baseUrl} style={{ color: "#a3a3a3" }}>
                poolemark.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
