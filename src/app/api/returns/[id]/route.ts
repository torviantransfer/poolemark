import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendReturnLabelEmail } from "@/lib/email";

export async function PATCH(
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

    const body = await request.json();
    const { status, return_shipping_company, return_barcode, admin_note } = body;

    const { data: currentRequest } = await supabase
      .from("order_return_requests")
      .select("id, order_id, status, return_shipping_company, return_barcode")
      .eq("id", id)
      .single();

    if (!currentRequest) {
      return NextResponse.json({ error: "İade talebi bulunamadı" }, { status: 404 });
    }

    const { error } = await supabase
      .from("order_return_requests")
      .update({
        status,
        return_shipping_company: return_shipping_company || null,
        return_barcode: return_barcode || null,
        admin_note: admin_note || null,
      } as never)
      .eq("id", id);

    if (error) {
      const missingTable = error.message?.toLowerCase().includes("order_return_requests") &&
        (error.message?.toLowerCase().includes("does not exist") || error.code === "42P01");

      return NextResponse.json(
        {
          error: missingTable
            ? "İade modülü veritabanında henüz aktif değil. Migration uygulanmalı: 20260423000016_order_invoice_and_returns.sql"
            : `İade güncellenemedi: ${error.message}`,
        },
        { status: missingTable ? 503 : 500 }
      );
    }

    const returnStatusesThatCloseOrder = ["approved", "in_transit", "completed"];
    if (status && returnStatusesThatCloseOrder.includes(status)) {
      await supabase
        .from("orders")
        .update({ status: "returned" } as never)
        .eq("id", currentRequest.order_id)
        .neq("status", "cancelled");
    }

    const oldBarcode = currentRequest.return_barcode || "";
    const newBarcode = return_barcode || "";
    const oldCompany = currentRequest.return_shipping_company || "";
    const newCompany = return_shipping_company || "";

    const returnShippingBecameReady =
      (!!newBarcode && oldBarcode !== newBarcode) ||
      (!!newCompany && oldCompany !== newCompany && !!newBarcode);

    if (returnShippingBecameReady && newBarcode) {
      const { data: order } = await supabase
        .from("orders")
        .select("order_number, user_id, guest_email, shipping_address_json")
        .eq("id", currentRequest.order_id)
        .single();

      if (order) {
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
          await sendReturnLabelEmail(recipientEmail, {
            firstName: recipientName,
            orderNumber: order.order_number,
            returnShippingCompany: newCompany || undefined,
            returnBarcode: newBarcode,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
