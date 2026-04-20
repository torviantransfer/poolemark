/**
 * Shopify CSV + Air Reviews XLSX → Supabase Migration Script
 *
 * Kullanım:
 *   node scripts/import-from-csv.mjs
 *
 * Gerekli .env.local değişkenleri:
 *   NEXT_PUBLIC_SUPABASE_URL    = "https://xxxx.supabase.co"
 *   SUPABASE_SERVICE_ROLE_KEY   = "service_role_key"
 *
 * Dosyalar (Downloads klasöründen otomatik okunur):
 *   ~/Downloads/products_export_*.csv  → ürünler
 *   ~/Downloads/*.xlsx (Air Reviews formatı) → yorumlar
 *
 * NOT: Shopify HTML açıklamaları import edilmez.
 *       Ürün açıklamalarını admin panelinden SEO'ya göre yazın.
 */

import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import os from "os";
import { config } from "dotenv";

config({ path: path.resolve(process.cwd(), ".env.local") });

// ─── KONFİGÜRASYON ───────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_CATEGORY_ID = process.env.DEFAULT_CATEGORY_ID || null;
const STORAGE_BUCKET = "products";
const DOWNLOADS = path.join(os.homedir(), "Downloads");

// Shopify handle → DB slug eşleştirmesi
// Shopify'daki eski uzun handle farklıysa buraya ekle:
const HANDLE_MAP = {
  "beyaz-mermer-desenli-pvc-10-lu-duvar-kaplama-sticker-30-30-cm-aluminyum-plastik-suya-yaga-dayanikli":
    "beyaz-mermer-desenli-pvc-duvar-kaplama-sticker-suya-yaga-dayanikli",
  "3d-tugla-desenli-boyanabilir-duvar-paneli-6-li-set-58x38-cm":
    "3d-tugla-desenli-boyanabilir-duvar-paneli-58x38-cm",
};
// ─────────────────────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Shopify handle'ı → DB slug'a çevir (HANDLE_MAP'ten bak, yoksa slugify et) */
function resolveSlug(handle) {
  const slug = slugify(handle);
  return HANDLE_MAP[slug] || HANDLE_MAP[handle] || slug;
}

// ─── ÜRÜN CSV PARSE ──────────────────────────────────────────────────────────
function parseProductsCsv(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const { data } = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const productsMap = new Map();

  for (const row of data) {
    const handle = row["Handle"]?.trim();
    if (!handle) continue;

    if (!productsMap.has(handle)) {
      const price = parseFloat(row["Variant Price"] || "0") || 0;
      const comparePrice = parseFloat(row["Variant Compare At Price"] || "0") || null;
      const stock = parseInt(row["Variant Inventory Qty"] || "0", 10) || 0;

      productsMap.set(handle, {
        handle,
        name: row["Title"]?.trim() || handle,
        sku: row["Variant SKU"]?.trim() || null,
        price,
        compare_at_price: comparePrice > 0 ? comparePrice : null,
        stock_quantity: stock,
        is_active: row["Status"]?.trim().toLowerCase() === "active",
        images: [],
        variants: [],
      });
    }

    // Varyantları topla (her satır bir varyantı temsil eder)
    const variantOpts = [
      row["Option1 Value"]?.trim(),
      row["Option2 Value"]?.trim(),
      row["Option3 Value"]?.trim(),
    ].filter((v) => v && v.toLowerCase() !== "default title");
    if (variantOpts.length > 0) {
      const product = productsMap.get(handle);
      const variantName = variantOpts.join(" / ");
      const vPrice = parseFloat(row["Variant Price"] || "0") || product.price;
      const vStock = parseInt(row["Variant Inventory Qty"] || "0", 10) || 0;
      const vSku = row["Variant SKU"]?.trim() || null;
      if (!product.variants.some((v) => v.name === variantName)) {
        product.variants.push({
          name: variantName,
          sku: vSku,
          price: vPrice,
          stock_quantity: vStock,
          sort_order: product.variants.length,
          image_url: row["Variant Image"]?.trim() || null,
        });
      }
    }

    const imgSrc = row["Image Src"]?.trim();
    if (imgSrc) {
      const pos = parseInt(row["Image Position"] || "1", 10) - 1;
      const product = productsMap.get(handle);
      if (!product.images.some((i) => i.url === imgSrc)) {
        product.images.push({
          url: imgSrc,
          alt_text: row["Image Alt Text"]?.trim() || product.name,
          sort_order: pos >= 0 ? pos : product.images.length,
          is_primary: pos === 0 || product.images.length === 0,
        });
      }
    }
  }

  return Array.from(productsMap.values());
}

// ─── GÖRSEL İNDİR & SUPABASE STORAGE'A YÜKLE ────────────────────────────────
async function uploadImageToStorage(supabase, imageUrl, slug, index) {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
      ? "webp"
      : "jpg";
    const storagePath = `${slug}/${index}.${ext}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, { contentType, upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  } catch (err) {
    console.warn(`    ⚠️ Görsel yüklenemedi (${index}): ${err.message} → orijinal URL`);
    return imageUrl;
  }
}

// ─── ÜRÜN IMPORT ─────────────────────────────────────────────────────────────
async function importProducts(supabase, products) {
  console.log(`\n📦 ${products.length} ürün import ediliyor...\n`);
  let success = 0;
  let failed = 0;

  for (const p of products) {
    try {
      const slug = resolveSlug(p.handle);

      const { data: product, error } = await supabase
        .from("products")
        .upsert(
          {
            name: p.name,
            slug,
            description: null,       // SEO için admin'den yazılacak
            short_description: null,  // SEO için admin'den yazılacak
            sku: p.sku,
            price: p.price,
            compare_at_price: p.compare_at_price,
            stock_quantity: p.stock_quantity,
            is_active: p.is_active,
            is_featured: false,
            category_id: DEFAULT_CATEGORY_ID,
            meta_title: null,
            meta_description: null,
          },
          { onConflict: "slug" }
        )
        .select("id")
        .single();

      if (error) throw error;

      // Görselleri indir → Supabase Storage'a yükle
      if (p.images.length > 0) {
        process.stdout.write(`    📷 ${p.images.length} görsel yükleniyor...`);
        const images = [];
        for (let i = 0; i < p.images.length; i++) {
          const img = p.images[i];
          const finalUrl = await uploadImageToStorage(supabase, img.url, slug, i);
          images.push({
            product_id: product.id,
            url: finalUrl,
            alt_text: img.alt_text,
            sort_order: img.sort_order,
            is_primary: img.is_primary,
          });
        }
        process.stdout.write(" ✓\n");

        await supabase.from("product_images").delete().eq("product_id", product.id);
        const { error: imgError } = await supabase.from("product_images").insert(images);
        if (imgError) console.warn(`  ⚠️ Görsel DB hatası (${slug}):`, imgError.message);
      }

      // Varyantları kaydet
      if (p.variants && p.variants.length > 0) {
        await supabase.from("product_variants").delete().eq("product_id", product.id);
        const { error: varError } = await supabase.from("product_variants").insert(
          p.variants.map((v) => ({ ...v, product_id: product.id }))
        );
        if (varError) console.warn(`  ⚠️ Varyant DB hatası (${slug}):`, varError.message);
        else process.stdout.write(`    🎨 ${p.variants.length} varyant kaydedildi\n`);
      }

      console.log(`  ✅ "${p.name.slice(0, 60)}" → ${slug}`);
      success++;
    } catch (err) {
      console.error(`  ❌ "${p.name?.slice(0, 40)}" hatası:`, err.message);
      failed++;
    }
  }

  console.log(`\n📦 Ürünler: ${success} başarılı, ${failed} hatalı\n`);
}

// ─── REVIEWS XLSX PARSE ──────────────────────────────────────────────────────
function isAirReviewsFormat(rows) {
  if (!rows?.[0]) return false;
  const h = rows[0];
  return h.includes("product_handle") && h.includes("rating") && h.includes("content");
}

function parseReviewsXlsx(filePath) {
  const wb = xlsx.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });

  if (!isAirReviewsFormat(rows)) return null; // Air Reviews formatı değil

  const headers = rows[0];
  const reviews = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const get = (col) => row[headers.indexOf(col)];

    const handle = String(get("product_handle") || "").trim();
    const rating = Number(get("rating")) || 0;
    const comment = String(get("content") || "").trim();
    const status = String(get("status") || "").trim();
    const reviewerName = String(get("name") || "").trim();
    const createdAt = get("created_at");
    const photoUrlsRaw = String(get("photo_urls") || "").trim();

    // photo_urls virgülle ayrılmış URL listesi olabilir
    const photoUrls = photoUrlsRaw
      ? photoUrlsRaw.split(",").map((u) => u.trim()).filter(Boolean)
      : null;

    if (!handle || rating < 1 || rating > 5) continue;
    if (status !== "published") continue;

    const countryCode = String(get("country_code") || "").trim() || null;

    reviews.push({
      product_handle: handle,
      rating,
      comment: comment || null,
      reviewer_name: reviewerName || null,
      is_approved: true,
      is_verified_purchase: true,
      photo_urls: photoUrls?.length ? photoUrls : null,
      country_code: countryCode,
      created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    });
  }

  return reviews;
}

// ─── REVIEWS IMPORT ──────────────────────────────────────────────────────────
async function importAllReviews(supabase, allReviewsRaw) {
  // Mevcut yorumları temizle (tekrar çalıştırma koruması)
  const { error: delErr } = await supabase
    .from("reviews")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) console.warn("⚠️ Reviews temizlenemedi:", delErr.message);
  else console.log("🗑️  Mevcut yorumlar temizlendi.\n");

  // Tüm dosyalardan gelen yorumları deduplicate et
  const seen = new Map();
  for (const r of allReviewsRaw) {
    const key = `${r.product_handle}|${(r.reviewer_name || "").toLowerCase()}|${r.created_at.slice(0, 10)}|${r.rating}`;
    if (!seen.has(key)) seen.set(key, r);
  }
  const reviews = Array.from(seen.values());
  const dupes = allReviewsRaw.length - reviews.length;
  console.log(`\n⭐ ${reviews.length} tekil yorum import ediliyor${dupes > 0 ? ` (${dupes} duplicate atlandı)` : ""}...\n`);

  const { data: allProducts, error: fetchErr } = await supabase
    .from("products")
    .select("id, slug");

  if (fetchErr) {
    console.error("❌ Ürün listesi çekilemedi:", fetchErr.message);
    return;
  }

  const slugToId = new Map(allProducts.map((p) => [p.slug, p.id]));
  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const r of reviews) {
    const productSlug = resolveSlug(r.product_handle);
    const productId = slugToId.get(productSlug);

    if (!productId) {
      console.warn(`  ⚠️ Ürün bulunamadı: ${productSlug}`);
      skipped++;
      continue;
    }

    try {
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: null,
        rating: r.rating,
        comment: r.comment,
        reviewer_name: r.reviewer_name,
        is_approved: r.is_approved,
        is_verified_purchase: r.is_verified_purchase,
        photo_urls: r.photo_urls,
        country_code: r.country_code,
        created_at: r.created_at,
      });

      if (error) throw error;
      console.log(`  ✅ "${r.reviewer_name || "Anonim"}" → ${productSlug} (${r.rating}★)`);
      success++;
    } catch (err) {
      console.error(`  ❌ Yorum hatası (${productSlug}):`, err.message);
      failed++;
    }
  }

  console.log(`\n  Sonuç: ${success} başarılı, ${skipped} ürün yok, ${failed} hatalı\n`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("════════════════════════════════════════════");
  console.log("  Shopify → Poolemark CSV Import Scripti");
  console.log("════════════════════════════════════════════\n");

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ .env.local'da SUPABASE bilgileri eksik!");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  // 1. Ürün CSV'lerini import et
  const productCsvFiles = fs.readdirSync(DOWNLOADS)
    .filter((f) => /^products_export.*\.csv$/i.test(f))
    .map((f) => path.join(DOWNLOADS, f));

  if (productCsvFiles.length === 0) {
    console.log("⚠️ Downloads'ta ürün CSV bulunamadı (products_export*.csv)\n");
  } else {
    for (const csvFile of productCsvFiles) {
      console.log(`📄 Ürün CSV: ${path.basename(csvFile)}`);
      const products = parseProductsCsv(csvFile);
      console.log(`   ${products.length} benzersiz ürün parse edildi`);
      await importProducts(supabase, products);
    }
  }

  // 2. Tüm XLSX dosyalarını tara → Air Reviews formatındakileri topla
  const xlsxFiles = fs.readdirSync(DOWNLOADS)
    .filter((f) => f.endsWith(".xlsx") && !f.startsWith("~") && !f.startsWith("."))
    .sort()
    .map((f) => path.join(DOWNLOADS, f));

  if (xlsxFiles.length > 0) {
    const airReviewsFiles = xlsxFiles.filter((f) => path.basename(f).startsWith("air_reviews_export"));
    const otherXlsxFiles = xlsxFiles.filter((f) => !path.basename(f).startsWith("air_reviews_export"));

    // air_reviews: sadece en yeni dosyayı al (duplicate önleme)
    const filesToProcess = [
      ...otherXlsxFiles,
      ...(airReviewsFiles.length > 0 ? [airReviewsFiles.at(-1)] : []),
    ];

    console.log(`\n📂 ${filesToProcess.length} XLSX dosyası taranıyor...\n`);

    // Tüm dosyalardan yorumları topla
    const allReviewsRaw = [];
    for (const xlsxFile of filesToProcess) {
      const reviews = parseReviewsXlsx(xlsxFile);
      if (reviews === null) {
        console.log(`  ⏭️  Atlandı (Air Reviews değil): ${path.basename(xlsxFile)}`);
        continue;
      }
      console.log(`  📋 ${reviews.length} yorum okundu: ${path.basename(xlsxFile)}`);
      allReviewsRaw.push(...reviews);
    }

    if (allReviewsRaw.length > 0) {
      await importAllReviews(supabase, allReviewsRaw);
    }
  }

  console.log("════════════════════════════════════════════");
  console.log("  ✅ Import tamamlandı!");
  console.log("════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("\n💥 Beklenmeyen hata:", err);
  process.exit(1);
});
