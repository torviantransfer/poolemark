"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CoverageCalculatorProps {
  /** m² per pack, parsed from product name */
  sqmPerPack: number;
}

export function CoverageCalculator({ sqmPerPack }: CoverageCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const w = parseFloat(width.replace(",", "."));
  const h = parseFloat(height.replace(",", "."));
  const area = !isNaN(w) && w > 0 && !isNaN(h) && h > 0 ? w * h : null;

  const exact = area !== null ? Math.ceil(area / sqmPerPack) : null;
  const recommended = area !== null ? Math.ceil((area * 1.1) / sqmPerPack) : null;

  return (
    <>
      {/* Trigger — matches installment modal style */}
      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto inline-flex items-start sm:items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors text-left group"
      >
        <Calculator className="h-3.5 w-3.5 text-primary shrink-0 mt-px sm:mt-0" />
        <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0">
          <span>Kaç paket almalıyım?</span>
          <span className="text-primary font-medium underline underline-offset-2 decoration-dashed whitespace-nowrap">
            alan hesaplama
          </span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setWidth(""); setHeight(""); } }}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-5 pt-5 pb-3 pr-12 border-b sticky top-0 bg-white z-10">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-5 w-5 text-primary" />
              Kaç Paket Almalıyım?
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ölçülerinizi girin, gereken paket sayısını hesaplayalım.
            </p>
          </DialogHeader>

          <div className="px-5 pb-6 pt-4 space-y-4">
            {/* Info box */}
            <div className="rounded-lg border bg-secondary/30 px-3 py-2.5 text-xs text-muted-foreground">
              1 paket = <span className="font-semibold text-foreground">{sqmPerPack} m²</span> kaplama alanı
            </div>

            {/* Inputs */}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Genişlik (m)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  placeholder="örn. 2.5"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div className="flex h-10 w-7 items-end justify-center pb-2.5 text-muted-foreground font-semibold text-base">
                ×
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Yükseklik (m)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  placeholder="örn. 1.2"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Results */}
            {area !== null && exact !== null && recommended !== null ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-primary/15">
                  <div className="px-4 py-3">
                    <p className="text-[11px] text-muted-foreground">Toplam alan</p>
                    <p className="text-base font-semibold text-foreground mt-0.5">
                      {area.toFixed(2)} m²
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[11px] text-muted-foreground">Minimum gerekli</p>
                    <p className="text-base font-semibold text-foreground mt-0.5">
                      {exact} paket
                    </p>
                  </div>
                </div>
                <div className="border-t border-primary/15 px-4 py-3 flex items-center justify-between bg-primary/8">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">%10 fire payıyla önerilen</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Kesim ve hizalama payı dahil
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-primary">{recommended} paket</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-5 text-center">
                <p className="text-sm text-muted-foreground">
                  Genişlik ve yükseklik girin, sonuç burada görünecek.
                </p>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground">
              * Hesaplama tahminidir. Karmaşık yüzeyler veya özel kesimler için ek paket almanız önerilir.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
