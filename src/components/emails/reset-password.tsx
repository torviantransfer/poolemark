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