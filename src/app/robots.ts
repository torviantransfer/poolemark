import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/hesabim/", "/checkout", "/sepet"],
      },
    ],
    sitemap: "https://poolemark.com/sitemap.xml",
  };
}
