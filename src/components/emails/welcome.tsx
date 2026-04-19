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

interface WelcomeEmailProps {
  firstName: string;
}

export function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  return (
    <Html>
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
