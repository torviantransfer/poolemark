"use client";

import { useEffect, useState } from "react";
import { X, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STORAGE_KEY = "poolemark_exit_intent_seen";
const COUPON_CODE = "HOSGELDIN10";

export function ExitIntent() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // sadece desktop
    if (window.matchMedia("(max-width: 768px)").matches) return;
    if (window.sessionStorage.getItem(STORAGE_KEY)) return;

    let triggered = false;
    const handler = (e: MouseEvent) => {
      if (triggered) return;
      // viewport'tan yukarı çıkıyorsa
      if (e.clientY <= 0) {
        triggered = true;
        window.sessionStorage.setItem(STORAGE_KEY, "1");
        setOpen(true);
      }
    };

    // sayfa yüklendikten 5 sn sonra dinle (hemen tetiklenmesin)
    const timer = window.setTimeout(() => {
      document.addEventListener("mouseleave", handler);
    }, 5000);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseleave", handler);
    };
  }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
      toast.success("Kupon kodu kopyalandı");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopyalanamadı");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-foreground/60 hover:text-foreground transition-colors"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 pb-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white mb-4 shadow-lg">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Gitme, sana özel hediyemiz var!</h2>
          <p className="text-sm text-muted-foreground mt-2">
            İlk siparişine özel %10 indirim. Aşağıdaki kodu kullan.
          </p>
        </div>

        <div className="px-8 pb-8 space-y-4">
          <div className="flex items-stretch gap-2">
            <div className="flex-1 px-4 py-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Kupon Kodu</p>
              <p className="text-lg font-bold tracking-widest text-primary">{COUPON_CODE}</p>
            </div>
            <Button onClick={onCopy} variant="outline" className="h-auto px-3" aria-label="Kodu kopyala">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <Button onClick={() => setOpen(false)} className="w-full" size="lg">
            Alışverişe Devam Et
          </Button>

          <p className="text-[11px] text-center text-muted-foreground">
            Kod çıkışta otomatik uygulanır. 250₺ ve üzeri siparişlerde geçerli.
          </p>
        </div>
      </div>
    </div>
  );
}
