import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendReturnRequestedEmail } from "@/lib/email";

const RETURN_LABELS: Record<string, string> = {
  requested: "Talep Alındı",
  approved: "Onaylandı",
  in_transit: "Kargoda",
  completed: "Tamamlandı",
  rejected: "Reddedildi",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const { data: order } = await supabase
      .from("orders")
      .select("id, user_id, order_number")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    const body = await request.json();
    const reason = String(body?.reason || "diger").slice(0, 120);
    const description = String(body?.description || "").slice(0, 1000);

    const { data: existing } = await supabase
      .from("order_return_requests")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Bu sipariş için zaten iade talebi oluşturulmuş." },
        { status: 409 }
      );
    }

    const { error } = await supabase.from("order_return_requests").insert({
      order_id: orderId,
      user_id: user.id,
      reason,
      description: description || null,
      status: "requested",
    } as never);

    if (error) {
      const missingTable = error.message?.toLowerCase().includes("order_return_requests") &&
        (error.message?.toLowerCase().includes("does not exist") || error.code === "42P01");

      return NextResponse.json(
        {
          error: missingTable
            ? "İade modülü veritabanında henüz aktif değil. Migration uygulanmalı: 20260423000016_order_invoice_and_returns.sql"
            : `İade talebi oluşturulamadı: ${error.message}`,
        },
        { status: missingTable ? 503 : 500 }
      );
    }

    // Customer confirmation email
    let firstName = "Değerli Müşterimiz";
    if (user.user_metadata?.first_name) {
      firstName = String(user.user_metadata.first_name);
    }
    if (user.email) {
      await sendReturnRequestedEmail(user.email, {
        firstName,
        orderNumber: order.order_number,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const missingTable = String(error?.message || "")
      .toLowerCase()
      .includes("order_return_requests") &&
      (String(error?.message || "").toLowerCase().includes("does not exist") ||
        error?.code === "42P01");

    return NextResponse.json(
      {
        error: missingTable
          ? "İade modülü veritabanında henüz aktif değil. Migration uygulanmalı: 20260423000016_order_invoice_and_returns.sql"
          : "Bir hata oluştu.",
      },
      { status: missingTable ? 503 : 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    const { data: ret } = await supabase
      .from("order_return_requests")
      .select("status, return_shipping_company, return_barcode")
      .eq("order_id", orderId)
      .maybeSingle();

    return NextResponse.json({
      status: ret?.status || null,
      statusLabel: ret?.status ? RETURN_LABELS[ret.status] || ret.status : null,
      returnShippingCompany: ret?.return_shipping_company || null,
      returnBarcode: ret?.return_barcode || null,
    });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}
