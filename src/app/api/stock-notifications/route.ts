import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const productId = String(body.productId || "").trim();
    const variantId = body.variantId ? String(body.variantId).trim() : null;

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi girin." },
        { status: 400 }
      );
    }
    if (!productId) {
      return NextResponse.json({ error: "Ürün bilgisi eksik." }, { status: 400 });
    }

    const supabase = await createClient();

    // Confirm product exists and is currently out of stock
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, stock_quantity")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }

    // Insert (unique partial index prevents duplicates while pending)
    const { error: insertError } = await supabase
      .from("stock_notifications")
      .insert({
        email,
        product_id: productId,
        variant_id: variantId,
      });

    if (insertError) {
      // Duplicate -> friendly message
      if (insertError.code === "23505") {
        return NextResponse.json({
          ok: true,
          message: "Zaten bu ürün için bilgilendirme listesindesiniz.",
        });
      }
      console.error("stock_notifications insert error:", insertError);
      return NextResponse.json(
        { error: "Kayıt sırasında bir hata oluştu." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Stok geldiğinde size haber vereceğiz.",
    });
  } catch (err) {
    console.error("stock-notifications route error:", err);
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
