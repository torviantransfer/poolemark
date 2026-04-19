import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/types";

export async function getProductReviews(
  productId: string
): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, user:users!user_id(first_name, last_name)")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getProductRating(
  productId: string
): Promise<{ average: number; count: number }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_approved", true);

  if (error) throw error;

  const reviews = data || [];
  if (reviews.length === 0) return { average: 0, count: 0 };

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
}
