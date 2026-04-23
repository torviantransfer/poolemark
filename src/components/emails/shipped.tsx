import {
  Hr,
  Link,
  Section,
  Text,
} from "@react-email/components";
import { baseUrl, styles, colors, EmailLayout } from "./shared";

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
    <EmailLayout preview={`Siparişiniz kargoya verildi — ${orderNumber}`}>
      {/* Blue info banner */}
      <Section
        style={{
          backgroundColor: "#EFF6FF",
          borderBottom: "1px solid #BFDBFE",
          padding: "20px 40px",
          textAlign: "center",
        }}
      >
        <Text style={{ fontSize: "32px", margin: "0 0 8px", lineHeight: "1" }}>
          🚚
        </Text>
        <Text
          style={{
            color: "#1D4ED8",
            fontSize: "16px",
            fontWeight: "700",
            margin: "0",
          }}
        >
          Siparişiniz Kargoya Verildi!
        </Text>
      </Section>

      <Section style={styles.content}>
        <Text style={styles.text}>
          Merhaba <strong>{firstName}</strong>,
        </Text>
        <Text style={styles.text}>
          <strong>{orderNumber}</strong> numaralı siparişiniz kargoya verildi.
          Tahmini teslimat süresi 1-3 iş günüdür.
        </Text>

        {/* Cargo Details Box */}
        <Section style={styles.infoBox}>
          <Text
            style={{
              color: colors.muted,
              fontSize: "11px",
              fontWeight: "600",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              margin: "0 0 12px",
            }}
          >
            KARGO BİLGİLERİ
          </Text>
          <Text style={{ ...styles.text, margin: "0 0 8px" }}>
            <strong>Kargo Firması:</strong> {cargoCompany}
          </Text>
          <Text
            style={{
              ...styles.text,
              margin: "0",
              fontFamily: "monospace",
              fontSize: "15px",
              fontWeight: "600",
              color: colors.dark,
              backgroundColor: colors.white,
              border: `1px solid ${colors.border}`,
              borderRadius: "6px",
              padding: "10px 14px",
              marginTop: "8px",
            }}
          >
            {trackingNumber}
          </Text>
        </Section>

        {/* Tracking Button */}
        <Section style={{ textAlign: "center", marginTop: "24px" }}>
          {trackingUrl ? (
            <Link href={trackingUrl} style={styles.button}>
              Kargo Takibi Yap →
            </Link>
          ) : (
            <Link
              href={`${baseUrl}/siparis-takip`}
              style={styles.button}
            >
              Sipariş Takibi →
            </Link>
          )}
        </Section>

        <Hr style={styles.hr} />

        {/* Help text */}
        <Text style={{ ...styles.textSmall, textAlign: "center" }}>
          Kargonuzu teslim alırken paketinizi kontrol etmeyi unutmayın.
          <br />
          Herhangi bir sorun olursa{" "}
          <Link href={`${baseUrl}/iletisim`} style={{ color: colors.primary }}>
            bize ulaşın
          </Link>
          .
        </Text>
      </Section>
    </EmailLayout>
  );
}