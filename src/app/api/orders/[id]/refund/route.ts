import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPayTRRefund } from "@/lib/paytr";

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
      .select("id, order_number, total, payment_status, status")
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
      referenceNo: `${order.order_number}-FULL`,
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

    return NextResponse.json({ success: true, refundedAmount: amount.toFixed(2) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "İade işlemi başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
