import {
  Hr,
  Link,
  Section,
  Text,
} from "@react-email/components";
import { baseUrl, styles, colors, EmailLayout } from "./shared";

interface WelcomeEmailProps {
  firstName: string;
}

export function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Poolemark'a hoş geldiniz! Hesabınız hazır.">
      <Section style={styles.content}>
        <Text style={styles.heading}>
          Hoş Geldiniz, {firstName}! 🎉
        </Text>
        <Text style={styles.text}>
          Poolemark ailesine katıldığınız için teşekkür ederiz. Hesabınız başarıyla oluşturuldu.
        </Text>
        <Text style={styles.text}>
          Yapışkanlı PVC duvar paneli ve mermer folyo ile evinizi kırmadan dökmeden yenileyebilirsiniz.
        </Text>

        <Hr style={styles.hr} />

        <Text style={styles.subheading}>Hesabınızda Neler Var?</Text>

        <Section style={styles.infoBox}>
          <Text style={{ ...styles.text, margin: "0 0 8px" }}>
            ✓ Sipariş geçmişinizi takip edin
          </Text>
          <Text style={{ ...styles.text, margin: "0 0 8px" }}>
            ✓ Favori ürünlerinizi kaydedin
          </Text>
          <Text style={{ ...styles.text, margin: "0 0 8px" }}>
            ✓ Adreslerinizi kaydedip hızlı alışveriş yapın
          </Text>
          <Text style={{ ...styles.text, margin: "0" }}>
            ✓ Özel kampanya ve indirimlerden haberdar olun
          </Text>
        </Section>

        <Section style={{ textAlign: "center", marginTop: "28px" }}>
          <Link href={`${baseUrl}/products`} style={styles.button}>
            Ürünleri Keşfedin →
          </Link>
        </Section>

        <Hr style={styles.hr} />

        <Text style={{ ...styles.textSmall, textAlign: "center" }}>
          500₺ üzeri siparişlerde ücretsiz kargo!
          <br />
          Tüm kredi kartlarına 12 taksit imkanı.
        </Text>
      </Section>
    </EmailLayout>
  );
}
