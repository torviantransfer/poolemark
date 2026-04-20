import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shipping_companies")
      .select("id, name, code, price, free_shipping_threshold, estimated_days")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ companies: [] }, { status: 500 });
    }

    return NextResponse.json({ companies: data || [] });
  } catch {
    return NextResponse.json({ companies: [] }, { status: 500 });
  }
}
