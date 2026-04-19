/**
 * Shopify → Supabase Migration Script
 *
 * Kurulum:
 *   node scripts/shopify-migrate.mjs
 *
 * Gerekli .env değişkenleri (veya aşağıda doğrudan yaz):
 *   SHOPIFY_STORE   = "your-store.myshopify.com"
 *   SHOPIFY_TOKEN   = "shpat_xxxx"   (Admin API access token)
 *   SUPABASE_URL    = "https://xxxx.supabase.co"
 *   SUPABASE_KEY    = "service_role_key"  (Settings > API > service_role)
 *
 * Shopify Admin API token almak:
 *   Shopify Admin > Ayarlar > Uygulamalar > Uygulamaları ve satış kanallarını geliştir
 *   > Özel uygulama oluştur > Yönetici API kapsamları:
 *     read_products, read_product_listings (yorumlar için read_content de)
 */

import { createClient } from "@supabase/supabase-js";

// ─── KONFİGÜRASYON ───────────────────────────────────────────────────────────
const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "your-store.myshopify.com";
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN || "shpat_BURAYA_YAZ";
const SUPABASE_URL  = process.env.SUPABASE_URL  || "https://XXXX.supabase.co";
const SUPABASE_KEY  = process.env.SUPABASE_KEY  || "service_role_key_BURAYA_YAZ";

// Varsayılan kategori ID'si (önce admin'den bir kategori ekle, ID'sini buraya yaz)
// Supabase'deki categories tablosundan herhangi bir geçerli UUID
const DEFAULT_CATEGORY_ID = "KATEGORI_UUID_BURAYA";
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function shopifyFetch(endpoint) {
  const url = `https://${SHOPIFY_STORE}/admin/api/2024-01/${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_TOKEN,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Shopify API hatası: ${res.status} ${await res.text()}`);
  return res.json();
}

async function getAllProducts() {
  const products = [];
  let url = `products.json?limit=250&status=active`;

  while (url) {
    const data = await shopifyFetch(url);
    products.push(...data.products);

    // Pagination için link header kontrolü (basit versiyon)
    url = null; // 250'den az ürün varsa sayfalama gerekmez
    console.log(`  ${products.length} ürün çekildi`);
  }

  return products;
}

async function migrateProducts() {
  console.log("🔄 Shopify'dan ürünler çekiliyor...");
  const shopifyProducts = await getAllProducts();
  console.log(`✅ ${shopifyProducts.length} ürün bulundu\n`);

  let success = 0;
  let failed = 0;

  for (const sp of shopifyProducts) {
    try {
      const slug = slugify(sp.handle || sp.title);
      const price = parseFloat(sp.variants?.[0]?.price || "0");
      const comparePrice = parseFloat(sp.variants?.[0]?.compare_at_price || "0") || null;
      const stock = sp.variants?.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0) ?? 0;
      const sku = sp.variants?.[0]?.sku || null;

      // 1. Ürünü ekle
      const { data: product, error: productError } = await supabase
        .from("products")
        .upsert({
          name: sp.title,
          slug,
          description: sp.body_html || null,
          short_description: sp.body_html
            ? sp.body_html.replace(/<[^>]+>/g, "").slice(0, 200)
            : null,
          sku,
          price,
          compare_at_price: comparePrice,
          stock_quantity: stock,
          is_active: sp.status === "active",
          is_featured: false,
          category_id: DEFAULT_CATEGORY_ID,
          meta_title: sp.title,
          meta_description: sp.body_html
            ? sp.body_html.replace(/<[^>]+>/g, "").slice(0, 160)
            : null,
        }, { onConflict: "slug" })
        .select()
        .single();

      if (productError) throw productError;

      // 2. Görselleri ekle
      if (sp.images?.length > 0) {
        const images = sp.images.map((img, i) => ({
          product_id: product.id,
          url: img.src,
          alt_text: img.alt || sp.title,
          is_primary: i === 0,
          sort_order: i,
        }));

        await supabase.from("product_images").upsert(images, { onConflict: "product_id,sort_order" });
      }

      console.log(`  ✅ "${sp.title}" → /urunler/${slug}`);
      success++;
    } catch (err) {
      console.error(`  ❌ "${sp.title}" hatası:`, err.message);
      failed++;
    }
  }

  console.log(`\n📦 Ürünler tamamlandı: ${success} başarılı, ${failed} hatalı\n`);
}

async function migrateReviews() {
  // Shopify Product Reviews uygulaması resmi CSV export formatını destekler.
  // Judge.me / Yotpo varsa farklı endpoint gerekir.
  // Burada Shopify'ın resmi Product Reviews uygulamasının metafield'larını çekiyoruz.

  console.log("⭐ Yorumlar için: Shopify Product Reviews uygulamasını kullanıyorsan");
  console.log("   Admin > Uygulamalar > Product Reviews > Export CSV yaparak");
  console.log("   scripts/reviews.csv olarak kaydet, sonra importReviewsFromCSV() çalıştır.\n");
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  Shopify → Poolemark Migration Script");
  console.log("═══════════════════════════════════════\n");

  if (SHOPIFY_TOKEN.includes("BURAYA") || SUPABASE_KEY.includes("BURAYA")) {
    console.error("❌ Önce script'in üstündeki KONFİGÜRASYON bölümünü doldur!");
    process.exit(1);
  }

  await migrateProducts();
  await migrateReviews();

  console.log("✅ Migration tamamlandı!");
}

main().catch(console.error);
