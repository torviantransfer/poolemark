import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Ürün URL'leri
      {
        source: "/urunler",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/urunler/:path*",
        destination: "/products/:path*",
        permanent: true,
      },
      // Sayfa URL'leri
      {
        source: "/sayfa/:slug",
        destination: "/pages/:slug",
        permanent: true,
      },
      // Eski kısa URL'lerden /pages/ yapısına redirect
      { source: "/kvkk", destination: "/pages/kvkk-aydinlatma-metni", permanent: true },
      { source: "/pages/kvkk", destination: "/pages/kvkk-aydinlatma-metni", permanent: true },
      { source: "/gizlilik-politikasi", destination: "/pages/gizlilik-politikasi", permanent: true },
      { source: "/cerez-politikasi", destination: "/pages/cerez-politikasi", permanent: true },
      { source: "/mesafeli-satis-sozlesmesi", destination: "/pages/mesafeli-satis-sozlesmesi", permanent: true },
      { source: "/iade-ve-degisim", destination: "/pages/iade-degisim", permanent: true },
      { source: "/pages/iade-ve-degisim", destination: "/pages/iade-degisim", permanent: true },
      { source: "/kargo-ve-teslimat", destination: "/pages/kargo-teslimat", permanent: true },
      { source: "/pages/kargo-ve-teslimat", destination: "/pages/kargo-teslimat", permanent: true },
      { source: "/uyelik-sozlesmesi", destination: "/pages/uyelik-sozlesmesi", permanent: true },
      { source: "/kullanim-kosullari", destination: "/pages/kullanim-kosullari", permanent: true },
      { source: "/sss", destination: "/pages/sss", permanent: true },

      // Shopify legacy URL redirects
      { source: "/account", destination: "/hesabim", permanent: true },
      { source: "/account/login", destination: "/giris", permanent: true },
      { source: "/account/register", destination: "/kayit", permanent: true },
      { source: "/cart", destination: "/sepet", permanent: true },
      { source: "/collections", destination: "/products", permanent: true },
      { source: "/collections/all", destination: "/products", permanent: true },
      // Shopify koleksiyon URL'leri → kategori sayfası
      { source: "/collections/:slug", destination: "/kategori/:slug", permanent: true },
      // Shopify blog URL'leri → blog sayfası
      { source: "/blogs/:blog/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/blogs/:blog", destination: "/blog", permanent: true },
      // Shopify sayfa URL'leri (pages/ zaten mevcut)
      { source: "/pages/contact", destination: "/iletisim", permanent: true },
      { source: "/pages/hakkimizda", destination: "/hakkimizda", permanent: true },
      { source: "/pages/iletisim", destination: "/iletisim", permanent: true },
      { source: "/pages/about", destination: "/hakkimizda", permanent: true },
      { source: "/pages/blog", destination: "/blog", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
