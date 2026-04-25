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
