/**
 * Masaüstündeki varyant görsellerini Supabase'e yükler,
 * varyant isimlerini günceller (gri→antrasit, antrasit→sarı).
 *
 * Kullanım: node scripts/update-variant-images.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import path from "path";
import { config } from "dotenv";

config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "products";
const DESKTOP = path.join(process.env.USERPROFILE || process.env.HOME, "Desktop");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// variant DB adı → { yeni isim (null = değişmez), masaüstü dosya adı }
const UPDATES = [
  { id: "f4e7a24e-6e4a-4c71-ada6-91acba2d3548", name: null,       file: "beyaz.jpg" },       // beyaz-60-x-30
  { id: "ac110c4d-bd2e-474b-982a-ced5dd515ef4", name: null,       file: "siyah.jpg" },       // siyah-1
  { id: "bdf1f45b-a5bf-424f-baf9-aebd3cd707f5", name: "antrasit", file: "antirasit.jpg" },   // gri → antrasit
  { id: "e34cd66b-ca96-4c57-aed2-e839aebb4041", name: "sarı",     file: "sarı.jpg" },        // antrasit → sarı
  { id: "24ba7099-cf96-47b1-b8ce-e6742f8f30e3", name: null,       file: "vinil-beyaz.jpg" }, // visal-beyaz-60-x-30
  { id: "a37f046a-22a9-45c3-8592-8af2d2cd7acb", name: null,       file: "beyaz.jpg" },       // beyaz
  { id: "ecb3ab7b-c03c-4bea-aaa9-4d14be7f26e5", name: null,       file: "siyah.jpg" },       // siyah
];

async function uploadFile(filePath, storagePath) {
  const buffer = readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true });

  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return publicUrl;
}

async function main() {
  console.log("🎨 Varyant görselleri güncelleniyor...\n");

  for (const v of UPDATES) {
    const filePath = path.join(DESKTOP, v.file);
    const storagePath = `variants/${v.id}${path.extname(v.file)}`;

    try {
      const publicUrl = await uploadFile(filePath, storagePath);

      const updateData = { image_url: publicUrl };
      if (v.name) updateData.name = v.name;

      const { error } = await supabase
        .from("product_variants")
        .update(updateData)
        .eq("id", v.id);

      if (error) throw new Error(error.message);

      const label = v.name ? `→ "${v.name}"` : "";
      console.log(`✅ ${v.id.slice(0, 8)} ${label} → ${v.file}`);
    } catch (err) {
      console.log(`❌ ${v.id.slice(0, 8)}: ${err.message}`);
    }
  }

  console.log("\n✅ Tamamlandı.");
}

main().catch(console.error);
