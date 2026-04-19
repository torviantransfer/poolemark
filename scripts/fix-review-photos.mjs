import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data } = await sb.from("reviews").select("id, photo_urls").not("photo_urls", "is", null);
let fixed = 0;
for (const r of data) {
  const cleaned = r.photo_urls.filter((u) => u && !u.includes("cdn.shopify.com"));
  if (cleaned.length !== r.photo_urls.length) {
    await sb.from("reviews").update({ photo_urls: cleaned.length ? cleaned : null }).eq("id", r.id);
    fixed++;
  }
}
console.log("Temizlendi:", fixed, "yorum güncellendi");
