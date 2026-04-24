import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://poolemark.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Products
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("is_active", true);

  // Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, updated_at")
    .eq("is_active", true);

  // Blog posts
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("is_published", true);

  // Static CMS pages
  const { data: pages } = await supabase
    .from("pages")
    .select("slug, updated_at")
    .eq("is_active", true);

  const latest = (rows: { updated_at: string }[] | null | undefined) => {
    if (!rows || rows.length === 0) return new Date();
    const max = rows.reduce(
      (acc, r) => Math.max(acc, new Date(r.updated_at).getTime()),
      0,
    );
    return max ? new Date(max) : new Date();
  };

  const productsLastMod = latest(products);
  const blogLastMod = latest(posts);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: productsLastMod, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: productsLastMod, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: blogLastMod, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/hakkimizda`, lastModified: new Date("2026-01-01"), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/iletisim`, lastModified: new Date("2026-01-01"), changeFrequency: "monthly", priority: 0.5 },
  ];

  const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((c) => ({
    url: `${BASE_URL}/kategori/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = (posts || []).map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const cmsPages: MetadataRoute.Sitemap = (pages || []).map((p) => ({
    url: `${BASE_URL}/pages/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages, ...cmsPages];
}
