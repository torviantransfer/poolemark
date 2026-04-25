import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
// Saatte bir yeniden üretilsin (MC zaten günde 1 çekecek).
export const revalidate = 3600;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://poolemark.com").replace(/\/$/, "");
const BRAND = "Poolemark";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  const supabase = createAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, short_description, sku, barcode, price, compare_at_price, stock_quantity, weight, is_active, category:categories!category_id(name), images:product_images(url, sort_order)"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const items = (products || []).map((p) => {
    type ProductRow = typeof p & {
      images?: Array<{ url: string; sort_order: number }> | null;
      category?: { name?: string } | null;
    };
    const row = p as ProductRow;
    const images = (row.images || [])
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const mainImage = images[0]?.url || `${SITE_URL}/og-image.png`;
    const additionalImages = images.slice(1, 11).map((i) => i.url);
    const link = `${SITE_URL}/urunler/${row.slug}`;
    const description = stripHtml(row.description || row.short_description || row.name).slice(0, 4900);
    const availability = (row.stock_quantity ?? 0) > 0 ? "in_stock" : "out_of_stock";
    const price = `${Number(row.price).toFixed(2)} TRY`;
    const salePrice =
      row.compare_at_price && Number(row.compare_at_price) > Number(row.price)
        ? `${Number(row.price).toFixed(2)} TRY`
        : null;
    const regularPrice =
      row.compare_at_price && Number(row.compare_at_price) > Number(row.price)
        ? `${Number(row.compare_at_price).toFixed(2)} TRY`
        : price;
    const id = row.sku || row.id;
    const productType = row.category?.name || "Ev & Yaşam";

    const additionalImageXml = additionalImages
      .map((url) => `      <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`)
      .join("\n");

    return `    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title>${escapeXml(row.name)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>
${additionalImageXml}
      <g:availability>${availability}</g:availability>
      <g:price>${escapeXml(regularPrice)}</g:price>${
        salePrice ? `\n      <g:sale_price>${escapeXml(salePrice)}</g:sale_price>` : ""
      }
      <g:brand>${escapeXml(BRAND)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>${row.barcode ? "yes" : "no"}</g:identifier_exists>${
        row.barcode ? `\n      <g:gtin>${escapeXml(row.barcode)}</g:gtin>` : ""
      }
      <g:mpn>${escapeXml(row.sku || row.id)}</g:mpn>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      <g:shipping>
        <g:country>TR</g:country>
        <g:service>Standart</g:service>
        <g:price>0.00 TRY</g:price>
      </g:shipping>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(BRAND)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(BRAND)} ürün feed'i</description>
${items.join("\n")}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
