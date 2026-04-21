import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "8"), 20);
    const sort = searchParams.get("sort") || "newest";
    const exclude = searchParams.get("exclude")?.split(",").filter(Boolean) || [];

    let query = supabase
      .from("products")
      .select("id, name, slug, price, compare_at_price, images:product_images(url, is_primary)")
      .eq("is_active", true);

    if (exclude.length > 0) {
      const quotedIds = exclude.map((id) => `"${id}"`).join(",");
      query = query.not("id", "in", `(${quotedIds})`);
    }

    switch (sort) {
      case "popular":
        query = query.eq("is_featured", true).order("created_at", { ascending: false });
        break;
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;

    const products = (data || []).map((p) => ({
      ...p,
      images: ((p.images as { url: string; is_primary?: boolean }[]) || [])
        .sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)))
        .map((img) => img.url),
    }));

    return NextResponse.json({ products });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : (err as { message?: string })?.message || JSON.stringify(err);
    console.error("Products API error:", err);
    return NextResponse.json(
      {
        products: [],
        error: errorMessage || "Ürünler getirilemedi",
      },
      { status: 500 }
    );
  }
}
