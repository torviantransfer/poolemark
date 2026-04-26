"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/helpers";
import { CreditCard, Loader2 } from "lucide-react";

interface InstallmentModalProps {
  price: number;
  quantity?: number;
  unitPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
}

const PAYTR_TOKEN = process.env.NEXT_PUBLIC_PAYTR_INSTALLMENT_TOKEN || "";
const PAYTR_MERCHANT_ID = process.env.NEXT_PUBLIC_PAYTR_MERCHANT_ID || "";

export function InstallmentModal({
  price,
  quantity,
  unitPrice,
  minQuantity = 1,
  maxQuantity = 10,
}: InstallmentModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const hasQuantitySelector = typeof unitPrice === "number";
  const safeMinQuantity = Math.max(1, minQuantity);
  const safeMaxQuantity = Math.max(safeMinQuantity, maxQuantity);
  const initialQty = Math.min(
    safeMaxQuantity,
    Math.max(safeMinQuantity, quantity ?? safeMinQuantity)
  );

  const [modalQuantity, setModalQuantity] = useState(initialQty);

  useEffect(() => {
    setModalQuantity(initialQty);
  }, [initialQty]);

  const calculatedTotal = hasQuantitySelector
    ? (unitPrice as number) * modalQuantity
    : price;

  // PayTR taksit tablosunu, modal açıldığında veya tutar değiştiğinde yükle.
  useEffect(() => {
    if (!open) return;
    if (!PAYTR_TOKEN || !PAYTR_MERCHANT_ID) return;

    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    container.innerHTML = '<div id="paytr_taksit_tablosu"></div>';

    const script = document.createElement("script");
    script.src = `https://www.paytr.com/odeme/taksit-tablosu/v2?token=${encodeURIComponent(
      PAYTR_TOKEN
    )}&merchant_id=${encodeURIComponent(
      PAYTR_MERCHANT_ID
    )}&amount=${calculatedTotal.toFixed(2)}&taksit=0&tumu=0`;
    script.async = true;
    script.onload = () => setLoading(false);
    script.onerror = () => setLoading(false);
    container.appendChild(script);

    // Tablo DOM'a basıldığında spinner'ı kapat (script onload her zaman çalışmıyor).
    const observer = new MutationObserver(() => {
      const wrappers = container.querySelectorAll(".taksit-tablosu-wrapper");
      if (wrappers.length > 0) {
        setLoading(false);
        observer.disconnect();
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    const timeoutId = window.setTimeout(() => setLoading(false), 6000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, [open, calculatedTotal]);

  const previewMonthly = useMemo(() => Math.ceil(price / 12), [price]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto inline-flex items-start sm:items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors text-left group"
      >
        <CreditCard className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0">
          <span>12 taksitte yalnızca</span>
          <span className="font-semibold text-foreground group-hover:text-primary whitespace-nowrap">
            {formatPrice(previewMonthly)}/ay
          </span>
          <span className="text-primary font-medium underline underline-offset-2 decoration-dashed whitespace-nowrap">
            taksit tablosu
          </span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-4 sm:px-6 pt-5 pb-3 pr-12 border-b sticky top-0 bg-white z-10">
            <DialogTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5 text-primary" />
              Taksit Seçenekleri
            </DialogTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Anlaşmalı bankaların güncel taksit oranları (PayTR)
            </p>
          </DialogHeader>

          <div className="px-4 sm:px-6 pb-6 pt-4 space-y-4">
            <div className="rounded-xl border bg-secondary/30 p-3">
              <p className="text-xs text-muted-foreground">Hesaplanan ödeme tutarı</p>
              <p className="text-base font-semibold text-foreground mt-0.5">
                {formatPrice(calculatedTotal)}
              </p>

              {hasQuantitySelector && (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden bg-white h-9">
                    <button
                      type="button"
                      onClick={() =>
                        setModalQuantity((q) => Math.max(safeMinQuantity, q - 1))
                      }
                      disabled={modalQuantity <= safeMinQuantity}
                      className="h-full w-9 inline-flex items-center justify-center text-sm hover:bg-muted disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-semibold tabular-nums">
                      {modalQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setModalQuantity((q) => Math.min(safeMaxQuantity, q + 1))
                      }
                      disabled={modalQuantity >= safeMaxQuantity}
                      className="h-full w-9 inline-flex items-center justify-center text-sm hover:bg-muted disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Adet</span>
                </div>
              )}

              {hasQuantitySelector && typeof unitPrice === "number" && modalQuantity > 0 && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  {modalQuantity} adet x {formatPrice(unitPrice)}
                </p>
              )}
            </div>

            {!PAYTR_TOKEN || !PAYTR_MERCHANT_ID ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Taksit tablosu yapılandırılmamış. Lütfen sistem yöneticinize başvurun.
              </div>
            ) : (
              <div className="relative min-h-[200px] overflow-x-auto">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                )}
                <div ref={containerRef} className="paytr-installment-host min-w-0" />
              </div>
            )}

            <p className="text-[11px] text-muted-foreground border-t pt-4">
              Taksit seçenekleri bankanızın kampanya koşullarına göre değişebilir. Kesin
              tutar ödeme sayfasında görüntülenir.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
