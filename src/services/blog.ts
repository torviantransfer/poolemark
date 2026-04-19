import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types";

export async function getBlogPosts(
  page = 1,
  limit = 9
): Promise<{ posts: BlogPost[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("blog_posts")
    .select("*, author:users!author_id(first_name, last_name)", {
      count: "exact",
    })
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { posts: data || [], total: count || 0 };
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, author:users!author_id(first_name, last_name)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) return null;
  return data;
}

export async function getRecentBlogPosts(limit = 3): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, author:users!author_id(first_name, last_name)")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
