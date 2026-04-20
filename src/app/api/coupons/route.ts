import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json({ error: "Kupon kodu gereklidir." }, { status: 400 });
    }

    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (!coupon) {
      return NextResponse.json({ error: "Geçersiz kupon kodu." }, { status: 404 });
    }

    // Check dates
    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return NextResponse.json({ error: "Bu kupon henüz aktif değil." }, { status: 400 });
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return NextResponse.json({ error: "Bu kuponun süresi dolmuş." }, { status: 400 });
    }

    // Check usage limit
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: "Bu kupon kullanım limitine ulaşmış." }, { status: 400 });
    }

    // Check min order
    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      return NextResponse.json(
        { error: `Minimum sipariş tutarı ${coupon.min_order_amount} TL olmalıdır.` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === "free_shipping") {
      discount = 0; // handled at checkout level
    } else if (coupon.type === "percentage") {
      discount = (subtotal * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
      discount: Math.min(discount, subtotal),
    });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}
