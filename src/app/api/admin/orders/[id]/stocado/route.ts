import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createShipment, companyNameFromSlug, isKargopaneliConfigured } from "@/lib/kargopaneli";
import { sendShippedEmail } from "@/lib/email";
import { sendShippedTemplate } from "@/lib/whatsapp";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Admin doğrulama
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

    if (!isKargopaneliConfigured()) {
      return NextResponse.json(
        { error: "Stocado ayarları eksik. Lütfen ortam değişkenlerini tanımlayın." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const cargoCompanyId = String(body.cargoCompanyId || "").trim();
    const payOnDelivery = Boolean(body.payOnDelivery);
    const payOnDeliveryAmount = Number(body.payOnDeliveryAmount || 0);
    const desi = Math.max(1, Number(body.desi || 1));

    if (!cargoCompanyId) {
      return NextResponse.json({ error: "Kargo firması seçilmedi." }, { status: 400 });
    }

    const { data: order } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, total, cargo_tracking_number, guest_email, user_id, shipping_address_json, user:users!user_id(email, first_name, last_name)"
      )
      .eq("id", id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }
    if (order.cargo_tracking_number) {
      return NextResponse.json(
        { error: "Bu sipariş için zaten kargo oluşturulmuş." },
        { status: 409 }
      );
    }

    const addr = (order.shipping_address_json as Record<string, string> | null) || {};
    const orderUser = order.user as
      | { email?: string; first_name?: string; last_name?: string }
      | null;

    const firstName = addr.first_name || orderUser?.first_name || "";
    const lastName = addr.last_name || orderUser?.last_name || "";
    const receiverName = `${firstName} ${lastName}`.trim() || "Müşteri";
    const recipientEmail = orderUser?.email || order.guest_email || "";
    const phone = addr.phone || "";
    const city = addr.city || "";
    const district = addr.district || "";
    const details = `${addr.neighborhood ? addr.neighborhood + " " : ""}${addr.address_line || ""}`.trim();

    if (!phone || !city || !district || !details) {
      return NextResponse.json(
        { error: "Teslimat adresi eksik (telefon/il/ilçe/adres)." },
        { status: 400 }
      );
    }

    const result = await createShipment({
      cargoCompanyId,
      receiver: {
        name: receiverName,
        email: recipientEmail,
        phone,
        city,
        district,
        details,
        postalCode: addr.postal_code || "",
      },
      desi,
      payOnDelivery,
      payOnDeliveryAmount,
      orderNumber: order.order_number,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: `Gönderi oluşturulamadı: ${result.error}` },
        { status: 502 }
      );
    }

    const cargoCompanyName = companyNameFromSlug(cargoCompanyId);
    const trackingNumber = result.trackingCode || "";
    const trackingUrl = result.trackingLink || "";

    // Siparişi güncelle: kargoya verildi.
    await supabase
      .from("orders")
      .update({
        status: "shipped",
        cargo_company: cargoCompanyName,
        cargo_tracking_number: trackingNumber || null,
        cargo_tracking_url: trackingUrl || null,
      })
      .eq("id", order.id);

    // Müşteriye bildirim (e-posta + WhatsApp).
    if (recipientEmail) {
      try {
        await sendShippedEmail(recipientEmail, {
          firstName: firstName || "Değerli Müşterimiz",
          orderNumber: order.order_number,
          orderId: order.id,
          cargoCompany: cargoCompanyName,
          trackingNumber,
          trackingUrl: trackingUrl || undefined,
        });
      } catch (e) {
        console.warn("[Stocado] kargo e-postası gönderilemedi:", e);
      }
    }
    if (phone) {
      try {
        await sendShippedTemplate({
          toPhone: phone,
          customerName: firstName || "Değerli Müşterimiz",
          orderNumber: order.order_number,
          cargoCompany: cargoCompanyName,
          trackingNumber,
          trackingUrl: trackingUrl || "",
        });
      } catch (e) {
        console.warn("[Stocado] WhatsApp bilgilendirmesi gönderilemedi:", e);
      }
    }

    return NextResponse.json({
      success: true,
      trackingNumber,
      trackingUrl,
      cargoCompany: cargoCompanyName,
    });
  } catch (err) {
    console.error("[Stocado] gönderi hatası:", err);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
