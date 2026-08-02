import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppText } from "@/lib/whatsapp";
import * as Sentry from "@sentry/nextjs";

// Meta webhook doğrulaması (GET) — panelde Callback URL kaydedilirken çağrılır.
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = (process.env.WHATSAPP_VERIFY_TOKEN || "").trim();

  if (mode === "subscribe" && token && verifyToken && token === verifyToken) {
    return new NextResponse(challenge || "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

type IncomingMessage = {
  from?: string;
  type?: string;
  context?: { id?: string };
  button?: { text?: string; payload?: string };
  interactive?: { button_reply?: { id?: string; title?: string } };
};

function classifyReply(text: string): "confirmed" | "rejected" | null {
  const t = text.toLocaleLowerCase("tr-TR");
  if (t.includes("onaylıyorum") || t.includes("onayla") || t === "evet" || t.includes("confirm")) {
    return "confirmed";
  }
  if (t.includes("onaylamıyorum") || t.includes("reddet") || t === "hayır" || t.includes("reject") || t.includes("iptal")) {
    return "rejected";
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const value = payload?.entry?.[0]?.changes?.[0]?.value;

    // Teslim durumu bildirimleri (sent / delivered / read / failed).
    const statuses: {
      id?: string;
      status?: string;
      recipient_id?: string;
      errors?: { code?: number; title?: string; message?: string }[];
    }[] = value?.statuses ?? [];

    for (const st of statuses) {
      if (st.status === "failed") {
        const detail = st.errors?.[0];
        Sentry.captureMessage(
          `[WhatsApp] Mesaj teslim edilemedi: ${detail?.code ?? "?"} ${detail?.title ?? ""} ${detail?.message ?? ""}`.trim(),
          { level: "warning", extra: { messageId: st.id, recipient: st.recipient_id } }
        );
      }
    }

    const messages: IncomingMessage[] = value?.messages ?? [];

    if (!messages.length) {
      return new NextResponse("OK", { status: 200 });
    }

    // TEŞHİS: gelen mesajların ham özeti. Vercel loglarında görünür.
    const diagSummary = messages.map((m) => ({
      from: m.from,
      type: m.type,
      contextId: m.context?.id,
      buttonText: m.button?.text,
      buttonPayload: m.button?.payload,
      interactiveTitle: m.interactive?.button_reply?.title,
      interactiveId: m.interactive?.button_reply?.id,
    }));
    console.log("[WhatsApp Webhook] gelen:", JSON.stringify(diagSummary));
    Sentry.captureMessage(`[WhatsApp Webhook] ${messages.length} mesaj alındı`, {
      level: "info",
      extra: { messages: diagSummary },
    });

    const supabase = createAdminClient();

    for (const message of messages) {
      // Onay mesajımıza verilen yanıt: context.id = bizim gönderdiğimiz mesaj id'si.
      const originalMessageId = message.context?.id;
      if (!originalMessageId) {
        Sentry.captureMessage("[WhatsApp Webhook] context.id yok — yanıt eşleştirilemedi", {
          level: "warning",
          extra: { from: message.from, type: message.type },
        });
        continue;
      }

      const replyText =
        message.button?.text ||
        message.button?.payload ||
        message.interactive?.button_reply?.title ||
        message.interactive?.button_reply?.id ||
        "";

      const decision = classifyReply(replyText);
      if (!decision) {
        Sentry.captureMessage("[WhatsApp Webhook] yanıt sınıflandırılamadı", {
          level: "warning",
          extra: { replyText, originalMessageId },
        });
        continue;
      }

      const { data: order } = await supabase
        .from("orders")
        .select("id, order_number, cod_confirmation_status")
        .eq("cod_whatsapp_message_id", originalMessageId)
        .maybeSingle();

      if (!order) {
        Sentry.captureMessage("[WhatsApp Webhook] context.id ile eşleşen sipariş yok", {
          level: "warning",
          extra: { originalMessageId, decision },
        });
        continue;
      }
      // Zaten işlenmişse tekrar dokunma.
      if (order.cod_confirmation_status && order.cod_confirmation_status !== "pending") continue;

      if (decision === "confirmed") {
        await supabase
          .from("orders")
          .update({ cod_confirmation_status: "confirmed", status: "preparing" })
          .eq("id", order.id);
      } else {
        await supabase
          .from("orders")
          .update({ cod_confirmation_status: "rejected", status: "cancelled" })
          .eq("id", order.id);
      }

      // Müşteriye bilgilendirme yanıtı (24 saatlik pencere içinde, template gerekmez).
      if (message.from) {
        const replyMessage =
          decision === "confirmed"
            ? `Teşekkür ederiz! ${order.order_number} numaralı kapıda ödemeli siparişiniz onaylandı ve hazırlanmaya başlandı. Kargoya verildiğinde sizi ayrıca bilgilendireceğiz.`
            : `${order.order_number} numaralı siparişiniz talebiniz üzerine iptal edilmiştir. Fikir değiştirirseniz veya yardıma ihtiyacınız olursa bu mesaja yanıt yazabilirsiniz.`;
        try {
          await sendWhatsAppText(message.from, replyMessage);
        } catch (replyErr) {
          console.warn("[WhatsApp Webhook] bilgilendirme yanıtı gönderilemedi:", replyErr);
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[WhatsApp Webhook] error:", error);
    // 200 dönüyoruz ki Meta webhook'u devre dışı bırakmasın.
    return new NextResponse("OK", { status: 200 });
  }
}
