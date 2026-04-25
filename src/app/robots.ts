import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/hesabim/",
          "/checkout",
          "/sepet",
          "/odeme-sonucu",
          "/siparis-takip",
          "/arama",
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://poolemark.com"}/sitemap.xml`,
  };
}
