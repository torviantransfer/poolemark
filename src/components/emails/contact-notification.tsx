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
    <Html>
      <Head />
      <Preview>Yeni iletişim mesajı: {subject}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={baseUrl} style={styles.logo}>
              Poolemark
            </Link>
          </Section>
          <Section style={styles.content}>
            <Heading style={styles.heading}>
              Yeni İletişim Mesajı 📩
            </Heading>
            <Section
              style={{
                backgroundColor: "#F7F5F3",
                borderRadius: "10px",
                padding: "20px",
              }}
            >
              <Text style={{ ...styles.text, margin: "0 0 8px" }}>
                <strong>Gönderen:</strong> {name}
              </Text>
              <Text style={{ ...styles.text, margin: "0 0 8px" }}>
                <strong>E-posta:</strong>{" "}
                <Link href={`mailto:${email}`} style={{ color: "#E8712B" }}>
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

            <Text style={{ ...styles.text, fontWeight: "600", color: "#2D2D2D" }}>
              Mesaj:
            </Text>
            <Text style={{ ...styles.text, whiteSpace: "pre-wrap" }}>
              {message}
            </Text>
          </Section>
          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Bu mesaj poolemark.com iletişim formundan gönderilmiştir.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
