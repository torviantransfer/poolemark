import {
  Hr,
  Link,
  Section,
  Text,
} from "@react-email/components";
import { styles, colors, EmailLayout } from "./shared";

interface ContactNotificationEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export function ContactNotificationEmail({
  name,
  email,
  phone,
  subject,
  message,
}: ContactNotificationEmailProps) {
  return (
    <EmailLayout preview={`Yeni iletişim mesajı: ${subject}`}>
      <Section style={styles.content}>
        <Text style={styles.heading}>Yeni İletişim Mesajı</Text>

        <Section style={styles.infoBox}>
          <Text style={{ ...styles.text, margin: "0 0 8px" }}>
            <strong>Gönderen:</strong> {name}
          </Text>
          <Text style={{ ...styles.text, margin: "0 0 8px" }}>
            <strong>E-posta:</strong>{" "}
            <Link href={`mailto:${email}`} style={{ color: colors.primary }}>
              {email}
            </Link>
          </Text>
          {phone && (
            <Text style={{ ...styles.text, margin: "0 0 8px" }}>
              <strong>Telefon:</strong> {phone}
            </Text>
          )}
          <Text style={{ ...styles.text, margin: "0" }}>
            <strong>Konu:</strong> {subject}
          </Text>
        </Section>

        <Hr style={styles.hr} />

        <Text style={{ ...styles.text, fontWeight: "600", color: colors.dark }}>
          Mesaj:
        </Text>
        <Text
          style={{
            ...styles.text,
            whiteSpace: "pre-wrap",
            backgroundColor: colors.lightBg,
            borderRadius: "8px",
            padding: "16px",
            border: `1px solid ${colors.border}`,
          }}
        >
          {message}
        </Text>
      </Section>
    </EmailLayout>
  );
}
