import { createClient } from "@/lib/supabase/server";
import type { Banner } from "@/types";

export async function getBanners(
  position?: "hero" | "sidebar" | "footer"
): Promise<Banner[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  let query = supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (position) query = query.eq("position", position);

  // Filter by date range
  query = query.or(`starts_at.is.null,starts_at.lte.${now}`);
  query = query.or(`expires_at.is.null,expires_at.gte.${now}`);

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}
