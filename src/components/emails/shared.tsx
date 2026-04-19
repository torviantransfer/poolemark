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
