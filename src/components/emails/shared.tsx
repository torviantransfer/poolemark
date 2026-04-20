import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://poolemark.com";

const colors = {
  primary: "#22C55E",
  primaryDark: "#16A34A",
  dark: "#1A1A1A",
  text: "#4B5563",
  muted: "#9CA3AF",
  lightBg: "#F9FAFB",
  border: "#E5E7EB",
  white: "#FFFFFF",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
};

const styles = {
  body: {
    backgroundColor: colors.lightBg,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    margin: "0",
    padding: "0",
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: "12px",
    margin: "40px auto",
    maxWidth: "600px",
    overflow: "hidden" as const,
    border: `1px solid ${colors.border}`,
  },
  header: {
    backgroundColor: colors.dark,
    padding: "24px 40px",
    textAlign: "center" as const,
  },
  logo: {
    color: colors.white,
    fontSize: "24px",
    fontWeight: "700" as const,
    textDecoration: "none",
    letterSpacing: "-0.5px",
  },
  content: {
    padding: "36px 40px 28px",
  },
  heading: {
    color: colors.dark,
    fontSize: "22px",
    fontWeight: "700" as const,
    lineHeight: "30px",
    margin: "0 0 12px",
  },
  subheading: {
    color: colors.dark,
    fontSize: "16px",
    fontWeight: "600" as const,
    lineHeight: "24px",
    margin: "24px 0 8px",
  },
  text: {
    color: colors.text,
    fontSize: "14px",
    lineHeight: "24px",
    margin: "0 0 12px",
  },
  textSmall: {
    color: colors.muted,
    fontSize: "12px",
    lineHeight: "20px",
    margin: "0 0 8px",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: "8px",
    color: colors.white,
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "600" as const,
    padding: "12px 28px",
    textDecoration: "none",
    textAlign: "center" as const,
    marginTop: "16px",
  },
  buttonOutline: {
    backgroundColor: colors.white,
    border: `2px solid ${colors.primary}`,
    borderRadius: "8px",
    color: colors.primary,
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "600" as const,
    padding: "10px 28px",
    textDecoration: "none",
    textAlign: "center" as const,
    marginTop: "16px",
  },
  infoBox: {
    backgroundColor: colors.lightBg,
    borderRadius: "8px",
    border: `1px solid ${colors.border}`,
    padding: "16px 20px",
    marginTop: "16px",
  },
  highlightBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: "8px",
    border: `1px solid #BBF7D0`,
    padding: "16px 20px",
    marginTop: "16px",
    textAlign: "center" as const,
  },
  footer: {
    padding: "24px 40px 32px",
    textAlign: "center" as const,
    backgroundColor: colors.lightBg,
    borderTop: `1px solid ${colors.border}`,
  },
  footerText: {
    color: colors.muted,
    fontSize: "12px",
    lineHeight: "20px",
    margin: "0",
  },
  footerLink: {
    color: colors.muted,
    textDecoration: "underline",
  },
  hr: {
    borderColor: colors.border,
    margin: "24px 0",
  },
};

function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={baseUrl} style={styles.logo}>
              Poolemark
            </Link>
          </Section>
          {children}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Bu e-posta Poolemark tarafından gönderilmiştir.
            </Text>
            <Text style={{ ...styles.footerText, marginTop: "8px" }}>
              <Link href={`${baseUrl}/iletisim`} style={styles.footerLink}>
                İletişim
              </Link>
              {" · "}
              <Link href={`${baseUrl}/pages/iade-degisim`} style={styles.footerLink}>
                İade Politikası
              </Link>
              {" · "}
              <Link href={`${baseUrl}/siparis-takip`} style={styles.footerLink}>
                Sipariş Takibi
              </Link>
            </Text>
            <Text style={{ ...styles.footerText, marginTop: "12px" }}>
              © {new Date().getFullYear()} Poolemark — Yapışkanlı Duvar Paneli &amp; Folyo
              <br />
              Sedir Mahallesi, Muratpaşa / Antalya
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export { baseUrl, styles, colors, EmailLayout };
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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://poolemark.com";

const styles = {
  body: {
    backgroundColor: "#F7F5F3",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: "0",
    padding: "0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    margin: "40px auto",
    maxWidth: "560px",
    overflow: "hidden" as const,
  },
  header: {
    backgroundColor: "#E8712B",
    padding: "28px 40px",
    textAlign: "center" as const,
  },
  logo: {
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "700" as const,
    textDecoration: "none",
    letterSpacing: "-0.5px",
  },
  content: {
    padding: "32px 40px",
  },
  heading: {
    color: "#2D2D2D",
    fontSize: "20px",
    fontWeight: "700" as const,
    lineHeight: "28px",
    margin: "0 0 16px",
  },
  text: {
    color: "#737373",
    fontSize: "14px",
    lineHeight: "24px",
    margin: "0 0 12px",
  },
  button: {
    backgroundColor: "#E8712B",
    borderRadius: "10px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "600" as const,
    padding: "12px 28px",
    textDecoration: "none",
    textAlign: "center" as const,
    marginTop: "8px",
  },
  footer: {
    padding: "24px 40px",
    textAlign: "center" as const,
  },
  footerText: {
    color: "#a3a3a3",
    fontSize: "12px",
    lineHeight: "20px",
    margin: "0",
  },
  hr: {
    borderColor: "#e5e5e5",
    margin: "24px 0",
  },
};

export { baseUrl, styles };
