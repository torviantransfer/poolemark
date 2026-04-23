import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendShippedEmail, sendOrderConfirmationEmail } from "@/lib/email";

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
    const {
      status,
      payment_status,
      cargo_company,
      cargo_tracking_number,
      invoice_number,
      invoice_url,
    } = body;

    // Build tracking URL from DB-managed shipping company template; fallback to legacy mapping.
    async function getTrackingUrl(company: string, trackingNo: string): Promise<string | null> {
      if (!company || !trackingNo) return null;

      const { data: shippingCompany } = await supabase
        .from("shipping_companies")
        .select("tracking_url_template")
        .eq("name", company)
        .single();

      if (shippingCompany?.tracking_url_template) {
        return shippingCompany.tracking_url_template.replace("{tracking_number}", encodeURIComponent(trackingNo));
      }

      const c = company.toLowerCase();
      if (c.includes("yurtiçi") || c.includes("yurtici")) return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${trackingNo}`;
      if (c.includes("aras")) return `https://www.araskargo.com.tr/trs_gonderi_sorgula.aspx?p_kod=${trackingNo}`;
      if (c.includes("mng")) return `https://www.mngkargo.com.tr/gonderi-takip/?gonderino=${trackingNo}`;
      if (c.includes("ptt")) return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${trackingNo}`;
      if (c.includes("sürat") || c.includes("surat")) return `https://www.suratkargo.com.tr/gonderi-takip?code=${trackingNo}`;
      if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${trackingNo}`;
      if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${trackingNo}`;
      if (c.includes("trendyol") || c.includes("ty")) return `https://www.trendyolexpress.com/gonderi-takip/${trackingNo}`;
      if (c.includes("hepsijet")) return `https://www.hepsijet.com/gonderi-takip?barcode=${trackingNo}`;
      return null;
    }

    const trackingUrl = await getTrackingUrl(cargo_company, cargo_tracking_number);

    // Get current order before update (for shipped email check)
    const { data: currentOrder } = await supabase
      .from("orders")
      .select("status, payment_status, order_number, user_id, guest_email, shipping_address_json, cargo_company, cargo_tracking_number, subtotal, shipping_cost, discount_amount, total")
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
        cargo_tracking_url: trackingUrl,
        invoice_number: invoice_number || null,
        invoice_url: invoice_url || null,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
    }

    // Send shipped email when shipping info becomes available.
    const oldTracking = currentOrder.cargo_tracking_number || "";
    const newTracking = cargo_tracking_number || "";
    const oldCompany = currentOrder.cargo_company || "";
    const newCompany = cargo_company || "";

    const statusNowShippedLike =
      status === "shipped" ||
      status === "delivered" ||
      currentOrder.status === "shipped" ||
      currentOrder.status === "delivered";

    const shippingBecameReady =
      newCompany && (oldCompany !== newCompany || (!!newTracking && oldTracking !== newTracking));

    if (statusNowShippedLike && newCompany && shippingBecameReady) {
      let recipientEmail: string | null = null;
      let recipientName = "Değerli Müşterimiz";

      if (currentOrder.user_id) {
        const { data: orderUser } = await supabase
          .from("users")
          .select("email, first_name")
          .eq("id", currentOrder.user_id)
          .single();
        if (orderUser?.email) {
          recipientEmail = orderUser.email;
          recipientName = orderUser.first_name || recipientName;
        }
      }

      if (!recipientEmail && currentOrder.guest_email) {
        recipientEmail = currentOrder.guest_email;
        const shippingJson = currentOrder.shipping_address_json as Record<string, string> | null;
        recipientName = shippingJson?.first_name || recipientName;
      }

      if (recipientEmail) {
        await sendShippedEmail(recipientEmail, {
          firstName: recipientName,
          orderNumber: currentOrder.order_number,
          orderId: id,
          cargoCompany: newCompany,
          trackingNumber: newTracking,
          trackingUrl: trackingUrl || undefined,
        });
      }
    }

    // Send order confirmation email when payment status becomes paid
    if (payment_status === "paid" && currentOrder.payment_status !== "paid") {
      let recipientEmail: string | null = null;
      let recipientName = "Değerli Müşterimiz";

      if (currentOrder.user_id) {
        const { data: orderUser } = await supabase
          .from("users")
          .select("email, first_name")
          .eq("id", currentOrder.user_id)
          .single();
        if (orderUser?.email) {
          recipientEmail = orderUser.email;
          recipientName = orderUser.first_name || recipientName;
        }
      }

      if (!recipientEmail && currentOrder.guest_email) {
        recipientEmail = currentOrder.guest_email;
        const shippingJson = currentOrder.shipping_address_json as Record<string, string> | null;
        recipientName = shippingJson?.first_name || recipientName;
      }

      if (recipientEmail) {
        const { data: items } = await supabase
          .from("order_items")
          .select("product_name, quantity, unit_price")
          .eq("order_id", id);

        await sendOrderConfirmationEmail(recipientEmail, {
          firstName: recipientName,
          orderNumber: currentOrder.order_number,
          orderId: id,
          items: (items || []).map((i) => ({
            name: i.product_name,
            quantity: i.quantity,
            price: i.unit_price,
          })),
          subtotal: currentOrder.subtotal,
          shippingCost: currentOrder.shipping_cost,
          discount: currentOrder.discount_amount,
          total: currentOrder.total,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
