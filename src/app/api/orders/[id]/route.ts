import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendShippedEmail } from "@/lib/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (adminUser?.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await request.json();
    const { status, payment_status, cargo_company, cargo_tracking_number } = body;

    // Get current order before update (for shipped email check)
    const { data: currentOrder } = await supabase
      .from("orders")
      .select("status, order_number, user_id")
      .eq("id", id)
      .single();

    if (!currentOrder) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    // Update order
    const { error } = await supabase
      .from("orders")
      .update({
        status,
        payment_status,
        cargo_company: cargo_company || null,
        cargo_tracking_number: cargo_tracking_number || null,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
    }

    // Send shipped email if status changed to "shipped"
    if (status === "shipped" && currentOrder.status !== "shipped" && cargo_company && cargo_tracking_number) {
      const { data: orderUser } = await supabase
        .from("users")
        .select("email, first_name")
        .eq("id", currentOrder.user_id)
        .single();

      if (orderUser?.email) {
        sendShippedEmail(orderUser.email, {
          firstName: orderUser.first_name || "Değerli Müşterimiz",
          orderNumber: currentOrder.order_number,
          orderId: id,
          cargoCompany: cargo_company,
          trackingNumber: cargo_tracking_number,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
