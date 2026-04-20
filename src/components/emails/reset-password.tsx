import {
  Hr,
  Link,
  Section,
  Text,
} from "@react-email/components";
import { baseUrl, styles, colors, EmailLayout } from "./shared";

interface ResetPasswordEmailProps {
  firstName: string;
  resetLink: string;
}

export function ResetPasswordEmail({ firstName, resetLink }: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Şifre sıfırlama bağlantınız">
      <Section style={styles.content}>
        <Text style={styles.heading}>Şifre Sıfırlama</Text>
        <Text style={styles.text}>
          Merhaba <strong>{firstName || "Değerli Müşterimiz"}</strong>,
        </Text>
        <Text style={styles.text}>
          Hesabınız için bir şifre sıfırlama talebi aldık. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın.
        </Text>

        <Section style={{ textAlign: "center", marginTop: "24px" }}>
          <Link href={resetLink} style={styles.button}>
            Şifremi Sıfırla
          </Link>
        </Section>

        <Hr style={styles.hr} />

        <Section style={styles.infoBox}>
          <Text style={{ ...styles.textSmall, margin: "0" }}>
            ⚠️ Bu bağlantı 1 saat boyunca geçerlidir.
            <br />
            Eğer bu talebi siz yapmadıysanız, bu e-postayı dikkate almayın — hesabınız güvendedir.
          </Text>
        </Section>

        <Text style={{ ...styles.textSmall, marginTop: "16px" }}>
          Bağlantı çalışmıyorsa, aşağıdaki URL&apos;yi tarayıcınıza yapıştırın:
          <br />
          <Link href={resetLink} style={{ color: colors.primary, fontSize: "11px", wordBreak: "break-all" }}>
            {resetLink}
          </Link>
        </Text>
      </Section>
    </EmailLayout>
  );
}
import {
  Hr,
  Link,
  Section,
  Text,
} from "@react-email/components";
import { baseUrl, styles, colors, EmailLayout } from "./shared";

interface ResetPasswordEmailProps {
  firstName: string;
  resetLink: string;
}

export function ResetPasswordEmail({ firstName, resetLink }: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Şifre sıfırlama bağlantınız">
      <Section style={styles.content}>
        <Text style={styles.heading}>Şifre Sıfırlama</Text>
        <Text style={styles.text}>
          Merhaba <strong>{firstName || "Değerli Müşterimiz"}</strong>,
        </Text>
        <Text style={styles.text}>
          Hesabınız için bir şifre sıfırlama talebi aldık. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın.
        </Text>

        <Section style={{ textAlign: "center", marginTop: "24px" }}>
          <Link href={resetLink} style={styles.button}>
            Şifremi Sıfırla
          </Link>
        </Section>

        <Hr style={styles.hr} />

        <Section style={styles.infoBox}>
          <Text style={{ ...styles.textSmall, margin: "0" }}>
            ⚠️ Bu bağlantı 1 saat boyunca geçerlidir.
            <br />
            Eğer bu talebi siz yapmadıysanız, bu e-postayı dikkate almayın — hesabınız güvendedir.
          </Text>
        </Section>

        <Text style={{ ...styles.textSmall, marginTop: "16px" }}>
          Bağlantı çalışmıyorsa, aşağıdaki URL&apos;yi tarayıcınıza yapıştırın:
          <br />
          <Link href={resetLink} style={{ color: colors.primary, fontSize: "11px", wordBreak: "break-all" }}>
            {resetLink}
          </Link>
        </Text>
      </Section>
    </EmailLayout>
  );
}
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
