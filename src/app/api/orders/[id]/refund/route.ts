import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPayTRRefund } from "@/lib/paytr";
import { sendRefundCompletedEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

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

    const body = await request.json().catch(() => ({}));
    const requestedAmount = Number(body?.amount);

    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number, total, payment_status, status, user_id, guest_email, shipping_address_json")
      .eq("id", id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    if (order.payment_status === "refunded") {
      return NextResponse.json({ error: "Bu sipariş zaten iade edildi" }, { status: 409 });
    }

    if (order.payment_status !== "paid") {
      return NextResponse.json({ error: "Sadece ödenmiş siparişler iade edilebilir" }, { status: 400 });
    }

    const amount = Number.isFinite(requestedAmount) && requestedAmount > 0
      ? requestedAmount
      : Number(order.total);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Geçersiz iade tutarı" }, { status: 400 });
    }

    await createPayTRRefund({
      orderNumber: order.order_number,
      returnAmount: amount,
      referenceNo: `${order.order_number}FULL${Date.now()}`.replace(/[^A-Za-z0-9]/g, ""),
    });

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "refunded",
        status: "returned",
      })
      .eq("id", order.id);

    if (updateError) {
      return NextResponse.json({ error: "İade başarılı ancak sipariş durumu güncellenemedi" }, { status: 500 });
    }

    // Complete an active return request automatically if it exists.
    await supabase
      .from("order_return_requests")
      .update({ status: "completed" })
      .eq("order_id", order.id)
      .in("status", ["requested", "approved", "in_transit"] as never);

    let recipientEmail: string | null = null;
    let recipientName = "Değerli Müşterimiz";

    if (order.user_id) {
      const { data: profile } = await supabase
        .from("users")
        .select("email, first_name")
        .eq("id", order.user_id)
        .single();
      if (profile?.email) {
        recipientEmail = profile.email;
        recipientName = profile.first_name || recipientName;
      }
    }

    if (!recipientEmail && order.guest_email) {
      recipientEmail = order.guest_email;
      const shippingJson = order.shipping_address_json as Record<string, string> | null;
      recipientName = shippingJson?.first_name || recipientName;
    }

    if (recipientEmail) {
      await sendRefundCompletedEmail(recipientEmail, {
        firstName: recipientName,
        orderNumber: order.order_number,
        refundedAmount: amount,
      });
    }

    return NextResponse.json({ success: true, refundedAmount: amount.toFixed(2) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "İade işlemi başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
