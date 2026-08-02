/**
 * WhatsApp helpers for abandoned cart recovery.
 * Strategy: build a wa.me click-to-chat link with a prefilled message.
 * No paid WhatsApp Business API — admin manually sends from their own WhatsApp.
 */

export interface AbandonedCartItem {
  product_name: string;
  variant_info?: string | null;
  quantity: number;
}

/**
 * Convert a Turkish phone number to E.164 digits-only form for wa.me.
 * Accepts: "0532 123 45 67", "+90 532 123 45 67", "5321234567", "905321234567".
 * Returns digits only (e.g. "905321234567") or null if not parseable.
 */
export function normalizePhoneForWhatsApp(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;

  // Already with country code (90...): 12 digits
  if (digits.length === 12 && digits.startsWith("90")) return digits;
  // Local with leading 0 (0532...): 11 digits → strip 0, prepend 90
  if (digits.length === 11 && digits.startsWith("0")) return "90" + digits.slice(1);
  // Bare 10 digits (5321234567) → prepend 90
  if (digits.length === 10) return "90" + digits;
  // Anything else: return as-is if it looks plausible, else null
  if (digits.length >= 10 && digits.length <= 15) return digits;
  return null;
}

interface BuildMessageArgs {
  customerName: string;
  orderNumber: string;
  items: AbandonedCartItem[];
  total: number;
  recoverUrl: string;
}

/**
 * Build a friendly Turkish reminder message for an abandoned cart.
 * Kept short & non-pushy; no discount offered (legal-safe transactional tone).
 */
export function buildAbandonedCartMessage({
  customerName,
  orderNumber,
  items,
  total,
  recoverUrl,
}: BuildMessageArgs): string {
  const greeting = customerName?.trim()
    ? `Merhaba ${customerName.trim()},`
    : "Merhaba,";

  const itemLines = items
    .slice(0, 8)
    .map((i) => {
      const variant = i.variant_info ? ` (${i.variant_info})` : "";
      return `• ${i.product_name}${variant} x${i.quantity}`;
    })
    .join("\n");
  const moreLine = items.length > 8 ? `\n• ...ve ${items.length - 8} ürün daha` : "";

  const totalText = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(total);

  return [
    greeting,
    "",
    "Poolemark mağazamızdan siparişinizin yarım kaldığını fark ettik:",
    "",
    `${itemLines}${moreLine}`,
    "",
    `Sepet tutarı: ${totalText}`,
    `Sipariş no: ${orderNumber}`,
    "",
    "Aşağıdaki linkten kaldığınız yerden devam edebilirsiniz:",
    recoverUrl,
    "",
    "Bir sorun yaşadıysanız bu mesaja yanıt yazabilirsiniz, yardımcı olalım.",
  ].join("\n");
}

/**
 * Build a wa.me click-to-chat URL.
 */
export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

/* =========================================================================
 * WhatsApp Business Cloud API (Meta) — otomatik sipariş onay mesajları.
 * wa.me akışından bağımsızdır. Env değerleri yoksa sessizce devre dışı kalır.
 * ========================================================================= */

const WHATSAPP_GRAPH_VERSION = "v21.0";

function readWhatsAppEnv() {
  return {
    phoneNumberId: (process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim(),
    accessToken: (process.env.WHATSAPP_ACCESS_TOKEN || "").trim(),
    template: (process.env.WHATSAPP_ORDER_CONFIRM_TEMPLATE || "siparis_onay").trim(),
    templateLang: (process.env.WHATSAPP_ORDER_CONFIRM_TEMPLATE_LANG || "tr").trim(),
    shippedTemplate: (process.env.WHATSAPP_SHIPPED_TEMPLATE || "kargo_bilgi").trim(),
    shippedTemplateLang: (process.env.WHATSAPP_SHIPPED_TEMPLATE_LANG || "tr").trim(),
  };
}

export function isWhatsAppCloudConfigured(): boolean {
  const { phoneNumberId, accessToken } = readWhatsAppEnv();
  return !!phoneNumberId && !!accessToken;
}

interface CodConfirmationTemplateParams {
  toPhone: string;
  customerName: string;
  orderNumber: string;
  itemSummary: string; // "2 adet"
  total: number;
  deliveryLocation: string; // "Muratpaşa / Antalya"
}

/**
 * Kapıda ödeme siparişi için onaylı WhatsApp template'ini gönderir.
 * Template'te 4 gövde parametresi ({{1}} ad, {{2}} sipariş no, {{3}} ödeme tipi,
 * {{4}} tutar) ve iki hızlı yanıt butonu ("Onaylıyorum" / "Onaylamıyorum") bulunmalı.
 * Başarılıysa gönderilen mesajın WhatsApp message id'sini döndürür (webhook eşlemesi için).
 */
export async function sendCodConfirmationTemplate(
  params: CodConfirmationTemplateParams
): Promise<{ ok: boolean; messageId: string | null; error?: string }> {
  const { phoneNumberId, accessToken, template, templateLang } = readWhatsAppEnv();

  if (!phoneNumberId || !accessToken) {
    return { ok: false, messageId: null, error: "not_configured" };
  }

  const to = normalizePhoneForWhatsApp(params.toPhone);
  if (!to) {
    return { ok: false, messageId: null, error: "invalid_phone" };
  }

  const totalText = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(params.total);

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: template,
      language: { code: templateLang },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: params.customerName || "Müşterimiz" },
            { type: "text", text: params.orderNumber },
            { type: "text", text: params.itemSummary },
            { type: "text", text: totalText },
            { type: "text", text: params.deliveryLocation || "-" },
          ],
        },
      ],
    },
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${WHATSAPP_GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = (await res.json()) as {
      messages?: { id: string }[];
      error?: { message?: string };
    };

    if (!res.ok) {
      return {
        ok: false,
        messageId: null,
        error: data.error?.message || `http_${res.status}`,
      };
    }

    return { ok: true, messageId: data.messages?.[0]?.id ?? null };
  } catch (err) {
    return { ok: false, messageId: null, error: String(err) };
  }
}

/**
 * 24 saatlik müşteri hizmetleri penceresi içinde düz metin (session) mesajı gönderir.
 * Template gerektirmez; müşteri butona yanıt verdikten hemen sonra bilgilendirme için kullanılır.
 */
export async function sendWhatsAppText(
  toPhone: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const { phoneNumberId, accessToken } = readWhatsAppEnv();

  if (!phoneNumberId || !accessToken) {
    return { ok: false, error: "not_configured" };
  }

  const to = normalizePhoneForWhatsApp(toPhone);
  if (!to) {
    return { ok: false, error: "invalid_phone" };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${WHATSAPP_GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        }),
      }
    );

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      return { ok: false, error: data.error?.message || `http_${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

interface ShippedTemplateParams {
  toPhone: string;
  customerName: string;
  orderNumber: string;
  cargoCompany: string;
  trackingNumber: string;
  trackingUrl: string;
}

/**
 * "Kargoya verildi" bilgilendirme template'ini gönderir.
 * 24 saatlik pencere dışında gönderileceği için onaylı template zorunludur.
 * Template'te 5 gövde parametresi olmalı:
 * {{1}} ad, {{2}} sipariş no, {{3}} kargo firması, {{4}} takip no, {{5}} takip linki.
 */
export async function sendShippedTemplate(
  params: ShippedTemplateParams
): Promise<{ ok: boolean; error?: string }> {
  const { phoneNumberId, accessToken, shippedTemplate, shippedTemplateLang } = readWhatsAppEnv();

  if (!phoneNumberId || !accessToken) {
    return { ok: false, error: "not_configured" };
  }

  const to = normalizePhoneForWhatsApp(params.toPhone);
  if (!to) {
    return { ok: false, error: "invalid_phone" };
  }

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: shippedTemplate,
      language: { code: shippedTemplateLang },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: params.customerName || "Müşterimiz" },
            { type: "text", text: params.orderNumber },
            { type: "text", text: params.cargoCompany || "-" },
            { type: "text", text: params.trackingNumber || "-" },
            { type: "text", text: params.trackingUrl || "-" },
          ],
        },
      ],
    },
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${WHATSAPP_GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      return { ok: false, error: data.error?.message || `http_${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
