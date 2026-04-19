import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = Number(searchParams.get("page")) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    if (!q || q.length < 2) {
      return NextResponse.json({ products: [], total: 0 });
    }

    const supabase = await createClient();

    const { data, count } = await supabase
      .from("products")
      .select("id, name, slug, price, compare_at_price, images:product_images(url, is_primary)", { count: "exact" })
      .eq("is_active", true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      products: data || [],
      total: count || 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Arama yapılırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
