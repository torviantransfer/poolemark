"use client";

import { useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  buildAbandonedCartMessage,
  buildWhatsAppUrl,
  normalizePhoneForWhatsApp,
  type AbandonedCartItem,
} from "@/lib/whatsapp";

interface Props {
  orderId: string;
  orderNumber: string;
  customerName: string;
  phone: string | null | undefined;
  items: AbandonedCartItem[];
  total: number;
  alreadyRemindedAt?: string | null;
  variant?: "icon" | "full";
  className?: string;
}

/**
 * Opens WhatsApp Web with a prefilled abandoned-cart reminder message.
 * Also marks the order as "reminded" in the database so admin sees who's been contacted.
 */
export function WhatsAppReminderButton({
  orderId,
  orderNumber,
  customerName,
  phone,
  items,
  total,
  alreadyRemindedAt,
  variant = "full",
  className = "",
}: Props) {
  const [reminded, setReminded] = useState<string | null>(alreadyRemindedAt ?? null);
  const [busy, setBusy] = useState(false);

  const phoneDigits = normalizePhoneForWhatsApp(phone);
  const disabled = !phoneDigits;

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    if (!phoneDigits) {
      e.preventDefault();
      toast.error("Müşterinin telefon numarası eksik veya geçersiz");
      return;
    }
    setBusy(true);

    const siteUrl =
      typeof window !== "undefined" ? window.location.origin : "";
    const recoverUrl = `${siteUrl}/sepet?recover=${orderId}`;

    const message = buildAbandonedCartMessage({
      customerName,
      orderNumber,
      items,
      total,
      recoverUrl,
    });
    const waUrl = buildWhatsAppUrl(phoneDigits, message);

    // Open WhatsApp first (must happen synchronously to avoid popup blockers).
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // Best-effort: mark as reminded.
    try {
      const res = await fetch(`/api/orders/${orderId}/remind`, { method: "POST" });
      if (res.ok) {
        setReminded(new Date().toISOString());
      }
    } catch {
      // Silent — admin already has WhatsApp open.
    } finally {
      setBusy(false);
    }
  }

  const baseClasses =
    "inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors";
  const enabledClasses = "bg-[#25D366] text-white hover:bg-[#20bd5a]";
  const disabledClasses = "bg-gray-200 text-gray-400 cursor-not-allowed";
  const sizeClasses =
    variant === "icon" ? "h-8 w-8 justify-center" : "px-3 py-1.5 text-sm";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || busy}
      title={
        disabled
          ? "Telefon numarası yok"
          : reminded
            ? `Hatırlatıldı: ${new Date(reminded).toLocaleString("tr-TR")}`
            : "WhatsApp ile hatırlatma gönder"
      }
      className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses} ${sizeClasses} ${className}`}
    >
      {reminded ? (
        <Check className="h-4 w-4" />
      ) : (
        <MessageCircle className="h-4 w-4" />
      )}
      {variant === "full" && (
        <span>{reminded ? "Tekrar Hatırlat" : "WhatsApp ile Hatırlat"}</span>
      )}
    </button>
  );
}
