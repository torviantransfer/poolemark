import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { baseUrl, styles } from "./shared";

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderConfirmationEmailProps {
  firstName: string;
  orderNumber: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(price);
}

export function OrderConfirmationEmail({
  firstName,
  orderNumber,
  orderId,
  items,
  subtotal,
  shippingCost,
  discount,
  total,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Siparişiniz alındı — {orderNumber}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={baseUrl} style={styles.logo}>
              Poolemark
            </Link>
          </Section>
          <Section style={styles.content}>
            <Heading style={styles.heading}>
              Siparişiniz Alındı! ✅
            </Heading>
            <Text style={styles.text}>
              Merhaba {firstName}, siparişin başarıyla oluşturuldu.
            </Text>
            <Text
              style={{
                ...styles.text,
                backgroundColor: "#F7F5F3",
                borderRadius: "10px",
                padding: "16px",
                fontWeight: "600",
                color: "#2D2D2D",
                textAlign: "center",
              }}
            >
              Sipariş No: {orderNumber}
            </Text>

            {/* Items */}
            <Section style={{ marginTop: "24px" }}>
              {items.map((item, index) => (
                <Row
                  key={index}
                  style={{
                    borderBottom: "1px solid #e5e5e5",
                    padding: "12px 0",
                  }}
                >
                  <Column style={{ width: "60%" }}>
                    <Text style={{ ...styles.text, margin: "0", color: "#2D2D2D" }}>
                      {item.name}
                    </Text>
                    <Text style={{ ...styles.text, margin: "0", fontSize: "12px" }}>
                      {item.quantity} adet × {formatPrice(item.unitPrice)}
                    </Text>
                  </Column>
                  <Column style={{ width: "40%", textAlign: "right" }}>
                    <Text
                      style={{
                        ...styles.text,
                        margin: "0",
                        fontWeight: "600",
                        color: "#2D2D2D",
                      }}
                    >
                      {formatPrice(item.totalPrice)}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            {/* Totals */}
            <Section style={{ marginTop: "16px" }}>
              <Row>
                <Column style={{ width: "60%" }}>
                  <Text style={{ ...styles.text, margin: "4px 0" }}>Ara Toplam</Text>
                </Column>
                <Column style={{ width: "40%", textAlign: "right" }}>
                  <Text style={{ ...styles.text, margin: "4px 0" }}>
                    {formatPrice(subtotal)}
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column style={{ width: "60%" }}>
                  <Text style={{ ...styles.text, margin: "4px 0" }}>Kargo</Text>
                </Column>
                <Column style={{ width: "40%", textAlign: "right" }}>
                  <Text style={{ ...styles.text, margin: "4px 0", color: shippingCost === 0 ? "#16A34A" : "#737373" }}>
                    {shippingCost === 0 ? "Ücretsiz" : formatPrice(shippingCost)}
                  </Text>
                </Column>
              </Row>
              {discount > 0 && (
                <Row>
                  <Column style={{ width: "60%" }}>
                    <Text style={{ ...styles.text, margin: "4px 0", color: "#16A34A" }}>
                      İndirim
                    </Text>
                  </Column>
                  <Column style={{ width: "40%", textAlign: "right" }}>
                    <Text style={{ ...styles.text, margin: "4px 0", color: "#16A34A" }}>
                      -{formatPrice(discount)}
                    </Text>
                  </Column>
                </Row>
              )}
              <Hr style={{ ...styles.hr, margin: "12px 0" }} />
              <Row>
                <Column style={{ width: "60%" }}>
                  <Text
                    style={{
                      ...styles.text,
                      margin: "0",
                      fontWeight: "700",
                      color: "#2D2D2D",
                      fontSize: "16px",
                    }}
                  >
                    Toplam
                  </Text>
                </Column>
                <Column style={{ width: "40%", textAlign: "right" }}>
                  <Text
                    style={{
                      ...styles.text,
                      margin: "0",
                      fontWeight: "700",
                      color: "#2D2D2D",
                      fontSize: "16px",
                    }}
                  >
                    {formatPrice(total)}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Link
              href={`${baseUrl}/hesabim/siparislerim/${orderId}`}
              style={{ ...styles.button, marginTop: "24px" }}
            >
              Siparişi Görüntüle
            </Link>
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
