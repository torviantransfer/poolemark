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

interface ResetPasswordEmailProps {
  firstName: string;
  resetLink: string;
}

export function ResetPasswordEmail({ firstName, resetLink }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Poolemark şifre sıfırlama</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={baseUrl} style={styles.logo}>
              Poolemark
            </Link>
          </Section>
          <Section style={styles.content}>
            <Heading style={styles.heading}>Şifre Sıfırlama</Heading>
            <Text style={styles.text}>
              Merhaba {firstName},
            </Text>
            <Text style={styles.text}>
              Hesabın için bir şifre sıfırlama talebi aldık. Şifreni sıfırlamak
              için aşağıdaki butona tıkla:
            </Text>
            <Link href={resetLink} style={styles.button}>
              Şifremi Sıfırla
            </Link>
            <Text style={{ ...styles.text, marginTop: "24px" }}>
              Bu linkin geçerliliği 1 saat içinde sona erecektir.
            </Text>
            <Text style={styles.text}>
              Eğer bu talebi sen yapmadıysan, bu e-postayı görmezden gelebilirsin.
            </Text>
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
