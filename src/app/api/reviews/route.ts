import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { product_id, rating, comment, order_number, email } = body;

    if (!product_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Ürün ve geçerli bir puan (1-5) gereklidir." },
        { status: 400 }
      );
    }

    if (!comment?.trim()) {
      return NextResponse.json(
        { error: "Yorum metni gereklidir." },
        { status: 400 }
      );
    }

    let verified = false;
    let reviewerName = "Müşteri";
    let userId: string | null = user?.id || null;

    if (user) {
      // Logged-in user — verify they purchased this product
      const { data: orderItem } = await supabase
        .from("order_items")
        .select("id, orders!inner(user_id, payment_status)")
        .eq("product_id", product_id)
        .eq("orders.user_id", user.id)
        .eq("orders.payment_status", "paid")
        .limit(1)
        .single();

      verified = !!orderItem;

      const { data: userData } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      reviewerName = `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim() || "Müşteri";
    } else {
      // Guest — verify by order number + email
      if (!order_number || !email) {
        return NextResponse.json(
          { error: "Sipariş numarası ve e-posta ile doğrulama gereklidir." },
          { status: 400 }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Find order by number
      const { data: order } = await supabase
        .from("orders")
        .select("id, guest_email, payment_status, shipping_address_json, user_id")
        .eq("order_number", order_number.trim())
        .single();

      if (!order) {
        return NextResponse.json(
          { error: "Sipariş bulunamadı. Lütfen sipariş numaranızı kontrol edin." },
          { status: 404 }
        );
      }

      // Match email against guest_email or user's email
      const guestEmailMatch = order.guest_email?.toLowerCase() === normalizedEmail;

      let userEmailMatch = false;
      if (order.user_id) {
        const { data: orderUser } = await supabase.auth.admin.getUserById(order.user_id);
        userEmailMatch = orderUser?.user?.email?.toLowerCase() === normalizedEmail;
      }

      if (!guestEmailMatch && !userEmailMatch) {
        return NextResponse.json(
          { error: "E-posta adresi sipariş kayıtlarıyla eşleşmiyor." },
          { status: 403 }
        );
      }

      // Check payment
      if (order.payment_status !== "paid") {
        return NextResponse.json(
          { error: "Bu sipariş için ödeme tamamlanmamış." },
          { status: 403 }
        );
      }

      // Verify order contains this product
      const { data: orderItem } = await supabase
        .from("order_items")
        .select("id")
        .eq("order_id", order.id)
        .eq("product_id", product_id)
        .single();

      if (!orderItem) {
        return NextResponse.json(
          { error: "Bu sipariş içinde bu ürün bulunmuyor." },
          { status: 403 }
        );
      }

      verified = true;
      const addr = order.shipping_address_json as { first_name?: string; last_name?: string } | null;
      reviewerName = `${addr?.first_name || ""} ${addr?.last_name || ""}`.trim() || "Müşteri";
      userId = order.user_id;
    }

    // Check for duplicate
    const dupQuery = supabase
      .from("reviews")
      .select("id")
      .eq("product_id", product_id);

    if (userId) {
      dupQuery.eq("user_id", userId);
    }

    // For guests without user_id, skip dup check (they may review again only from different orders)

    const { error } = await supabase.from("reviews").insert({
      product_id,
      user_id: userId,
      rating,
      comment: comment.trim(),
      is_approved: false,
      is_verified_purchase: verified,
      reviewer_name: reviewerName,
    });

    if (error) {
      return NextResponse.json(
        { error: "Yorum gönderilemedi." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Yorumunuz incelemeye alındı, onaylandıktan sonra yayınlanacaktır.",
    });
  } catch {
    return NextResponse.json(
      { error: "Bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const body = await request.json();
    const { id, admin_reply } = body;

    if (!id) return NextResponse.json({ error: "id gerekli." }, { status: 400 });

    const { error } = await supabase
      .from("reviews")
      .update({
        admin_reply: admin_reply?.trim() || null,
        admin_reply_at: admin_reply?.trim() ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (error) return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}
