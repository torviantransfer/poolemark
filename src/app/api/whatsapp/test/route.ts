import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendCodConfirmationTemplate, isWhatsAppCloudConfigured } from "@/lib/whatsapp";

// Admin-only WhatsApp teşhis endpoint'i.
// Kullanım: /api/whatsapp/test?to=05xxxxxxxxx
// Meta API'nin döndürdüğü ham sonucu/gerçek hatayı gösterir.
export async function GET(request: NextRequest) {
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

  const to = request.nextUrl.searchParams.get("to");
  if (!to) {
    return NextResponse.json(
      { error: "Telefon numarası gerekli. Örnek: /api/whatsapp/test?to=05xxxxxxxxx" },
      { status: 400 }
    );
  }

  const configured = isWhatsAppCloudConfigured();

  const result = await sendCodConfirmationTemplate({
    toPhone: to,
    customerName: "Test Müşteri",
    orderNumber: "TEST-0001",
    itemSummary: "1 adet",
    total: 637.19,
    deliveryLocation: "Muratpaşa / Antalya",
  });

  return NextResponse.json({
    configured,
    envPresent: {
      WHATSAPP_PHONE_NUMBER_ID: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
      WHATSAPP_ACCESS_TOKEN: !!process.env.WHATSAPP_ACCESS_TOKEN,
    },
    template: process.env.WHATSAPP_ORDER_CONFIRM_TEMPLATE || "siparis_onay",
    templateLang: process.env.WHATSAPP_ORDER_CONFIRM_TEMPLATE_LANG || "tr",
    result,
  });
}
