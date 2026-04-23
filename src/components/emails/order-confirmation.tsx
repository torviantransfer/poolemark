import {
  Column,
  Hr,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { baseUrl, styles, colors, EmailLayout } from "./shared";

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
    <EmailLayout preview={`Siparişiniz alındı — ${orderNumber}`}>
      {/* Green banner */}
      <Section
        style={{
          backgroundColor: "#F0FDF4",
          borderBottom: `1px solid #BBF7D0`,
          padding: "20px 40px",
          textAlign: "center",
        }}
      >
        <Text
          style={{
            fontSize: "32px",
            margin: "0 0 8px",
            lineHeight: "1",
          }}
        >
          ✓
        </Text>
        <Text
          style={{
            color: colors.primaryDark,
            fontSize: "16px",
            fontWeight: "700",
            margin: "0",
          }}
        >
          Siparişiniz Başarıyla Alındı
        </Text>
      </Section>

      <Section style={styles.content}>
        <Text style={styles.text}>
          Merhaba <strong>{firstName}</strong>,
        </Text>
        <Text style={styles.text}>
          Siparişiniz başarıyla oluşturuldu. Ödemeniz onaylandıktan sonra siparişiniz hazırlanmaya başlanacaktır.
        </Text>

        {/* Order number box */}
        <Section style={styles.highlightBox}>
          <Text style={{ ...styles.textSmall, margin: "0 0 4px" }}>
            SİPARİŞ NUMARASI
          </Text>
          <Text
            style={{
              color: colors.dark,
              fontSize: "18px",
              fontWeight: "700",
              margin: "0",
              fontFamily: "monospace",
            }}
          >
            {orderNumber}
          </Text>
        </Section>

        {/* Items Table */}
        <Text style={styles.subheading}>Sipariş Detayı</Text>
        <Section>
          {items.map((item, index) => (
            <Row
              key={index}
              style={{
                borderBottom: `1px solid ${colors.border}`,
                padding: "12px 0",
              }}
            >
              <Column style={{ width: "60%", verticalAlign: "top" }}>
                <Text style={{ ...styles.text, margin: "0", color: colors.dark, fontWeight: "500" }}>
                  {item.name}
                </Text>
                <Text style={{ ...styles.textSmall, margin: "4px 0 0" }}>
                  {item.quantity} adet × {formatPrice(item.unitPrice)}
                </Text>
              </Column>
              <Column style={{ width: "40%", textAlign: "right", verticalAlign: "top" }}>
                <Text
                  style={{
                    ...styles.text,
                    margin: "0",
                    fontWeight: "600",
                    color: colors.dark,
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
              <Text
                style={{
                  ...styles.text,
                  margin: "4px 0",
                  color: shippingCost === 0 ? colors.success : colors.text,
                  fontWeight: shippingCost === 0 ? "600" : "400",
                }}
              >
                {shippingCost === 0 ? "Ücretsiz ✓" : formatPrice(shippingCost)}
              </Text>
            </Column>
          </Row>
          {discount > 0 && (
            <Row>
              <Column style={{ width: "60%" }}>
                <Text style={{ ...styles.text, margin: "4px 0", color: colors.success }}>
                  İndirim
                </Text>
              </Column>
              <Column style={{ width: "40%", textAlign: "right" }}>
                <Text style={{ ...styles.text, margin: "4px 0", color: colors.success }}>
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
                  color: colors.dark,
                  fontSize: "16px",
                  fontWeight: "700",
                  margin: "0",
                }}
              >
                Toplam
              </Text>
            </Column>
            <Column style={{ width: "40%", textAlign: "right" }}>
              <Text
                style={{
                  color: colors.dark,
                  fontSize: "16px",
                  fontWeight: "700",
                  margin: "0",
                }}
              >
                {formatPrice(total)}
              </Text>
            </Column>
          </Row>
        </Section>

        <Hr style={styles.hr} />

        {/* Next Steps */}
        <Text style={styles.subheading}>Sonraki Adımlar</Text>
        <Text style={styles.text}>
          1. Ödemeniz onaylanacak
          <br />
          2. Siparişiniz hazırlanacak
          <br />
          3. Kargoya verildiğinde takip numaranız e-posta ile gönderilecek
        </Text>

        {/* CTA Buttons */}
        <Section style={{ textAlign: "center", marginTop: "24px" }}>
          <Link
            href={`${baseUrl}/hesabim/siparislerim/${orderId}`}
            style={styles.button}
          >
            Siparişimi Görüntüle
          </Link>
        </Section>

        <Section style={{ textAlign: "center", marginTop: "12px" }}>
          <Link
            href={`${baseUrl}/siparis-takip`}
            style={{ ...styles.textSmall, color: colors.primary, textDecoration: "underline" }}
          >
            veya Sipariş Takip sayfasından sorgulayın
          </Link>
        </Section>
      </Section>
    </EmailLayout>
  );
}