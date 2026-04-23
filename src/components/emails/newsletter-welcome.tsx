import { Hr, Link, Section, Text } from "@react-email/components";
import { baseUrl, colors, EmailLayout, styles } from "./shared";

interface NewsletterWelcomeEmailProps {
  couponCode: string;
}

export function NewsletterWelcomeEmail({ couponCode }: NewsletterWelcomeEmailProps) {
  return (
    <EmailLayout preview="Poolemark bültenine hoş geldiniz - %10 indirim kodunuz hazır">
      <Section
        style={{
          backgroundColor: "#ECFDF3",
          borderBottom: "1px solid #BBF7D0",
          padding: "20px 40px",
          textAlign: "center",
        }}
      >
        <Text style={{ fontSize: "32px", margin: "0 0 8px", lineHeight: "1" }}>🎁</Text>
        <Text
          style={{
            color: "#166534",
            fontSize: "16px",
            fontWeight: "700",
            margin: "0",
          }}
        >
          Bültene Hoş Geldiniz!
        </Text>
      </Section>

      <Section style={styles.content}>
        <Text style={styles.text}>
          Poolemark bültenine katıldığınız için teşekkür ederiz.
        </Text>
        <Text style={styles.text}>
          İlk alışverişinizde kullanabileceğiniz <strong>%10 indirim</strong> kodunuz:
        </Text>

        <Section style={styles.infoBox}>
          <Text
            style={{
              margin: 0,
              textAlign: "center",
              fontFamily: "monospace",
              letterSpacing: "1px",
              fontSize: "24px",
              fontWeight: "700",
              color: colors.primaryDark,
            }}
          >
            {couponCode}
          </Text>
        </Section>

        <Text style={{ ...styles.textSmall, marginTop: "12px" }}>
          Kod yalnızca bir kez kullanılabilir ve sepet toplamına göre kampanya koşulları geçerlidir.
        </Text>

        <Section style={{ textAlign: "center", marginTop: "24px" }}>
          <Link href={`${baseUrl}/products`} style={styles.button}>
            Alışverişe Başla
          </Link>
        </Section>

        <Hr style={styles.hr} />

        <Text style={{ ...styles.textSmall, textAlign: "center" }}>
          Tüm kampanyalar için <Link href={`${baseUrl}/`} style={{ color: colors.primary }}>poolemark.com</Link> adresini ziyaret edebilirsiniz.
        </Text>
      </Section>
    </EmailLayout>
  );
}
