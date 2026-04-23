import { Hr, Link, Section, Text } from "@react-email/components";
import { baseUrl, colors, EmailLayout, styles } from "./shared";

interface ReturnUpdateEmailProps {
  firstName: string;
  orderNumber: string;
  title: string;
  message: string;
  returnShippingCompany?: string;
  returnBarcode?: string;
}

export function ReturnUpdateEmail({
  firstName,
  orderNumber,
  title,
  message,
  returnShippingCompany,
  returnBarcode,
}: ReturnUpdateEmailProps) {
  return (
    <EmailLayout preview={`${title} — ${orderNumber}`}>
      <Section
        style={{
          backgroundColor: "#FFF7ED",
          borderBottom: "1px solid #FED7AA",
          padding: "20px 40px",
          textAlign: "center",
        }}
      >
        <Text style={{ fontSize: "32px", margin: "0 0 8px", lineHeight: "1" }}>
          ↩️
        </Text>
        <Text
          style={{
            color: "#C2410C",
            fontSize: "16px",
            fontWeight: "700",
            margin: "0",
          }}
        >
          {title}
        </Text>
      </Section>

      <Section style={styles.content}>
        <Text style={styles.text}>
          Merhaba <strong>{firstName}</strong>,
        </Text>
        <Text style={styles.text}>
          <strong>{orderNumber}</strong> numaralı siparişiniz için iade sürecinde güncelleme var.
        </Text>
        <Text style={styles.text}>{message}</Text>

        {(returnShippingCompany || returnBarcode) && (
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
              İADE KARGO BİLGİLERİ
            </Text>
            {returnShippingCompany && (
              <Text style={{ ...styles.text, margin: "0 0 8px" }}>
                <strong>Kargo Firması:</strong> {returnShippingCompany}
              </Text>
            )}
            {returnBarcode && (
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
                {returnBarcode}
              </Text>
            )}
          </Section>
        )}

        <Section style={{ textAlign: "center", marginTop: "24px" }}>
          <Link href={`${baseUrl}/hesabim/siparislerim`} style={styles.button}>
            Sipariş Detayını Aç
          </Link>
        </Section>

        <Hr style={styles.hr} />

        <Text style={{ ...styles.textSmall, textAlign: "center" }}>
          Sorularınız için <Link href={`${baseUrl}/iletisim`} style={{ color: colors.primary }}>bizimle iletişime geçebilirsiniz</Link>.
        </Text>
      </Section>
    </EmailLayout>
  );
}
