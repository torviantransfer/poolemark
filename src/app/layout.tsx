import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/shared/json-ld";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Poolemark | Ev Gereçleri & Dekorasyon",
    template: "%s | Poolemark",
  },
  description:
    "Poolemark - Ev gereçleri, dekorasyon ürünleri, PVC panel, duvar kaplama ve daha fazlası. Uygun fiyat, hızlı kargo, ücretsiz iade.",
  keywords: [
    "ev gereçleri",
    "dekorasyon",
    "pvc panel",
    "duvar kaplama",
    "mermer folyo",
    "ev hırdavat",
    "poolemark",
    "mutfak gereçleri",
    "banyo aksesuarları",
  ],
  metadataBase: new URL("https://poolemark.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Poolemark",
    title: "Poolemark | Ev Gereçleri & Dekorasyon",
    description: "Ev gereçleri, dekorasyon ürünleri, PVC panel ve daha fazlası. 500₺ üzeri ücretsiz kargo, 12 taksit imkanı.",
    url: "https://poolemark.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
