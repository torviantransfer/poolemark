import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, email, phone } = body;

    if (!orderNumber || (!email && !phone)) {
      return NextResponse.json(
        { error: "Sipariş numarası ve e-posta veya telefon numarası gereklidir." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    let query = supabase
      .from("orders")
      .select(
        "id, order_number, status, payment_status, subtotal, shipping_cost, discount_amount, total, cargo_company, cargo_tracking_number, cargo_tracking_url, created_at, updated_at, shipping_address_json, guest_email, user_id, items:order_items(id, product_name, quantity, unit_price)"
      )
      .eq("order_number", orderNumber.trim().toUpperCase())
      .maybeSingle();

    const { data: order, error } = await query;

    if (error || !order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı. Lütfen bilgilerinizi kontrol edin." },
        { status: 404 }
      );
    }

    // Verify identity: match email against guest_email or user's email,
    // or match phone against shipping_address_json.phone
    let verified = false;

    if (email) {
      if (order.guest_email) {
        verified = order.guest_email.toLowerCase() === email.trim().toLowerCase();
      } else if (order.user_id) {
        const { data: profile } = await supabase
          .from("users")
          .select("email")
          .eq("id", order.user_id)
          .single();
        verified = profile?.email?.toLowerCase() === email.trim().toLowerCase();
      }
    }

    if (!verified && phone) {
      const addressPhone = (order.shipping_address_json as { phone?: string })?.phone;
      if (addressPhone) {
        const normalize = (p: string) => p.replace(/\D/g, "");
        verified = normalize(addressPhone).endsWith(normalize(phone.trim()));
      }
    }

    if (!verified) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı. Lütfen bilgilerinizi kontrol edin." },
        { status: 404 }
      );
    }

    const STATUS_LABELS: Record<string, string> = {
      pending: "Beklemede",
      confirmed: "Onaylandı",
      preparing: "Hazırlanıyor",
      shipped: "Kargoya Verildi",
      delivered: "Teslim Edildi",
      cancelled: "İptal Edildi",
      refunded: "İade Edildi",
    };

    return NextResponse.json({
      orderNumber: order.order_number,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status] ?? order.status,
      paymentStatus: order.payment_status,
      total: order.total,
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      discountAmount: order.discount_amount,
      cargoCompany: order.cargo_company,
      cargoTrackingNumber: order.cargo_tracking_number,
      cargoTrackingUrl: order.cargo_tracking_url,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      shippingAddress: {
        firstName: (order.shipping_address_json as Record<string, string>)?.first_name,
        lastName: (order.shipping_address_json as Record<string, string>)?.last_name,
        city: (order.shipping_address_json as Record<string, string>)?.city,
        district: (order.shipping_address_json as Record<string, string>)?.district,
      },
      items: order.items,
    });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}
