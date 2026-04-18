import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
    "Poolemark - Ev gereçleri, dekorasyon ürünleri, PVC panel, duvar kaplama ve daha fazlası. Uygun fiyat, hızlı kargo.",
  keywords: [
    "ev gereçleri",
    "dekorasyon",
    "pvc panel",
    "duvar kaplama",
    "mermer folyo",
    "ev hırdavat",
    "poolemark",
  ],
  metadataBase: new URL("https://poolemark.com"),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Poolemark",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
