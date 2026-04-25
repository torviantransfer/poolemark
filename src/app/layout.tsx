import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/shared/json-ld";
import { MetaPixel } from "@/components/shared/meta-pixel";
import { GoogleAnalytics } from "@/components/shared/google-analytics";
import { CartProvider } from "@/hooks/use-cart";
import { RootMobileNav } from "@/components/store/root-mobile-nav";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: {
    default: "PVC Duvar Paneli ve Mermer Folyo | Poolemark",
    template: "%s | Poolemark",
  },
  description:
    "Poolemark ile duvar paneli, 3D tuğla panel ve mermer folyo çözümleri. Kırmadan dökmeden pratik ev yenileme, Türkiye geneline hızlı kargo. Keşfedin!",
  keywords: [
    "pvc duvar paneli",
    "mermer desenli duvar paneli",
    "yapışkanlı folyo",
    "3d duvar paneli",
    "mermer desenli folyo",
    "duvar kaplama paneli",
    "mutfak tezgah arası kaplama",
    "banyo duvar kaplama",
    "kendinden yapışkanlı duvar paneli",
    "boyanabilir duvar paneli",
    "kiracı dostu dekorasyon",
    "fayans üstüne yapışkanlı panel",
    "poolemark",
  ],
  metadataBase: new URL("https://poolemark.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Poolemark",
    title: "PVC Duvar Paneli ve Mermer Folyo",
    description: "Duvar paneli, 3D tuğla panel ve mermer folyo çözümleri. Kırmadan dökmeden pratik ev yenileme, Türkiye geneline hızlı kargo.",
    url: "https://poolemark.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Poolemark - PVC Duvar Paneli ve Mermer Folyo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PVC Duvar Paneli ve Mermer Folyo",
    description: "Duvar paneli, 3D tuğla panel ve mermer folyo çözümleri. Kırmadan dökmeden pratik ev yenileme.",
    images: ["/og-image.png"],
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
  icons: {
    icon: [
      { url: "/seffaflogohero.png", type: "image/png" },
    ],
    apple: "/seffaflogohero.png",
    shortcut: "/seffaflogohero.png",
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
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-white focus:text-foreground focus:px-3 focus:py-2 focus:rounded-md focus:shadow"
        >
          İçeriğe atla
        </a>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <MetaPixel />
        <GoogleAnalytics />
        <CartProvider>
          {children}
          <RootMobileNav />
        </CartProvider>
        <Toaster position="top-right" richColors duration={3500} />
      </body>
    </html>
  );
}
