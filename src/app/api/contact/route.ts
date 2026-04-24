import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendContactNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Ad, e-posta, konu ve mesaj alanları zorunludur." },
        { status: 400 }
      );
    }

    // Input length limits
    if (typeof name !== "string" || name.length > 200 ||
        typeof email !== "string" || email.length > 254 ||
        typeof subject !== "string" || subject.length > 300 ||
        typeof message !== "string" || message.length > 5000 ||
        (phone && (typeof phone !== "string" || phone.length > 30))) {
      return NextResponse.json(
        { error: "Girilen veriler geçersiz uzunlukta." },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçersiz e-posta adresi." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      phone: phone || null,
      subject,
      message,
    });

    if (error) {
      return NextResponse.json(
        { error: "Mesajınız gönderilemedi. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    // Send admin notification email
    sendContactNotificationEmail({ name, email, phone, subject, message });

    return NextResponse.json({ success: true, message: "Mesajınız başarıyla gönderildi." });
  } catch {
    return NextResponse.json(
      { error: "Bir hata oluştu." },
      { status: 500 }
    );
  }
}
