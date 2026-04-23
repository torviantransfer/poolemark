import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

function isTruthySetting(value?: string | null) {
  if (!value) return false;
  return ["true", "1", "yes", "on"].includes(value.toLowerCase());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { message: "Bu e-posta adresi zaten kayıtlı." },
        { status: 200 }
      );
    }

    const { error } = await supabase.from("newsletter_subscribers").insert({ email });

    if (error) {
      return NextResponse.json(
        { error: "Kayıt yapılamadı. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    const { data: settingRows } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", [
        "newsletter_welcome_coupon_enabled",
        "newsletter_welcome_coupon_code",
      ]);

    const settingMap = (settingRows || []).reduce(
      (acc, row) => {
        acc[row.key] = row.value;
        return acc;
      },
      {} as Record<string, string>
    );

    const welcomeCouponEnabled = isTruthySetting(
      settingMap.newsletter_welcome_coupon_enabled || "false"
    );
    const welcomeCouponCode =
      settingMap.newsletter_welcome_coupon_code || "HOSGELDIN10";

    if (welcomeCouponEnabled) {
      await sendNewsletterWelcomeEmail(email, { couponCode: welcomeCouponCode });
    }

    return NextResponse.json({ success: true, message: "Bültenimize başarıyla kayıt oldunuz!" });
  } catch {
    return NextResponse.json(
      { error: "Bir hata oluştu." },
      { status: 500 }
    );
  }
}
