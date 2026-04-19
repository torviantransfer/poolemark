/**
 * Review fotoğraflarını Firebase'den indirip Supabase Storage'a yükler
 * ve DB'deki photo_urls kolonunu günceller.
 *
 * Kullanım:
 *   node scripts/migrate-review-photos.mjs
 */

import { createClient } from "@supabase/supabase-js";
import path from "path";
import { config } from "dotenv";

config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "products";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function downloadBuffer(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const buf = await res.arrayBuffer();
  return { buffer: Buffer.from(buf), contentType: res.headers.get("content-type") || "image/jpeg" };
}

function extFromContentType(ct) {
  if (ct.includes("webp")) return "webp";
  if (ct.includes("png")) return "png";
  if (ct.includes("gif")) return "gif";
  return "jpg";
}

function isExternalUrl(url) {
  return !url.includes(SUPABASE_URL);
}

async function main() {
  console.log("📸 Yorum fotoğrafları Supabase'e taşınıyor...\n");

  // photo_urls dolu olan tüm yorumları al
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, photo_urls")
    .not("photo_urls", "is", null);

  if (error) { console.error("DB hata:", error.message); process.exit(1); }

  const toProcess = reviews.filter(r =>
    r.photo_urls?.some(u => u && isExternalUrl(u) && !u.includes("cdn.shopify.com"))
  );

  console.log(`${toProcess.length} yorumda dış URL fotoğraf bulundu.\n`);

  let updated = 0;
  let failed = 0;

  for (const review of toProcess) {
    const newUrls = [];
    let changed = false;

    for (const url of review.photo_urls) {
      // Shopify CDN'den gelen ürün görselleri → atla (null koy)
      if (!url || url.includes("cdn.shopify.com")) {
        continue;
      }

      // Zaten Supabase'de → olduğu gibi bırak
      if (!isExternalUrl(url)) {
        newUrls.push(url);
        continue;
      }

      // Dış URL → indir ve yükle
      try {
        const { buffer, contentType } = await downloadBuffer(url);
        const ext = extFromContentType(contentType);
        const storagePath = `reviews/${review.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, buffer, { contentType, upsert: false });

        if (uploadErr) throw new Error(uploadErr.message);

        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(storagePath);

        newUrls.push(publicUrl);
        changed = true;
        process.stdout.write("✓");
      } catch (err) {
        process.stdout.write("✗");
        failed++;
        // İndirilemeyen URL'i koru
        newUrls.push(url);
      }
    }

    if (changed) {
      const finalUrls = newUrls.length > 0 ? newUrls : null;
      await supabase
        .from("reviews")
        .update({ photo_urls: finalUrls })
        .eq("id", review.id);
      updated++;
    }
  }

  console.log(`\n\n✅ Tamamlandı: ${updated} yorum güncellendi, ${failed} fotoğraf başarısız.`);
}

main().catch(console.error);
