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
          <Link href={`${baseUrl}/urunler`} style={styles.button}>
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
      <Head />
      <Preview>Poolemark ailesine hoş geldin, {firstName}!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href={baseUrl} style={styles.logo}>
              Poolemark
            </Link>
          </Section>
          <Section style={styles.content}>
            <Heading style={styles.heading}>
              Hoş geldin, {firstName}! 🎉
            </Heading>
            <Text style={styles.text}>
              Poolemark ailesine katıldığın için çok mutluyuz! Artık yüzlerce
              kaliteli ürünü indirimli fiyatlarla keşfedebilirsin.
            </Text>
            <Text style={styles.text}>
              Hesabınla neler yapabilirsin:
            </Text>
            <Text style={{ ...styles.text, paddingLeft: "16px" }}>
              • Siparişlerini kolayca takip et
              <br />
              • Favori ürünlerini kaydet
              <br />
              • Adreslerini yönet
              <br />
              • Özel kampanyalardan haberdar ol
            </Text>
            <Link href={`${baseUrl}/products`} style={styles.button}>
              Alışverişe Başla
            </Link>
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
