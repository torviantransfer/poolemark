"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/helpers";
import { CreditCard, CheckCircle2 } from "lucide-react";

interface InstallmentModalProps {
  price: number;
}

const INSTALLMENTS = [1, 3, 6, 9, 12];

// Garanti Bonus + İş Bankası Maximum World: 3-6-9-12 taksit peşin fiyatına
const PRIVILEGED_BANKS = [
  {
    name: "Garanti BBVA",
    card: "Bonus / Bonus Business",
    logo: "🟢",
    color: "text-[#006737]",
    bg: "bg-[#006737]/5 border-[#006737]/20",
  },
  {
    name: "İş Bankası",
    card: "Maximum / Maximum World",
    logo: "🔵",
    color: "text-[#1a3d8f]",
    bg: "bg-[#1a3d8f]/5 border-[#1a3d8f]/20",
  },
  {
    name: "Yapı Kredi",
    card: "World Card / Worldcard",
    logo: "🔵",
    color: "text-[#004b99]",
    bg: "bg-[#004b99]/5 border-[#004b99]/20",
  },
];

// Other banks — %3 vade farkı
const OTHER_BANKS = [
  "Akbank (Axess)",
  "Ziraat Bankası",
  "Halkbank",
  "Vakıfbank",
  "QNB Finansbank (CardFinans)",
  "Denizbank (Bonus Trink)",
  "TEB",
  "ING Bankası",
  "HSBC",
  "Odeabank",
  "Albaraka Türk",
  "Kuveyt Türk",
];

export function InstallmentModal({ price }: InstallmentModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors text-left group"
      >
        <CreditCard className="h-3.5 w-3.5 text-primary shrink-0" />
        <span>
          12 taksitte yalnızca{" "}
          <span className="font-semibold text-foreground group-hover:text-primary">
            {formatPrice(Math.ceil(price / 12))}/ay
          </span>
        </span>
        <span className="text-primary font-medium underline underline-offset-2 decoration-dashed">
          taksit tablosu
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
              Seçili bankalarda peşin fiyatına taksit imkânı
            </p>
          </DialogHeader>

          <div className="px-4 sm:px-6 pb-6 pt-4 space-y-6">
            {/* Peşin fiyatına taksit */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <h3 className="text-sm font-semibold text-green-700">Peşin Fiyatına Taksit Kartları</h3>
              </div>

              {/* Mobile: kart liste */}
              <div className="md:hidden space-y-3">
                {PRIVILEGED_BANKS.map((bank) => (
                  <div key={bank.name} className={`rounded-xl border ${bank.bg} p-3`}>
                    <div className="mb-2">
                      <p className={`font-semibold text-sm ${bank.color}`}>{bank.name}</p>
                      <p className="text-[11px] text-muted-foreground">{bank.card}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {INSTALLMENTS.map((n) => (
                        <div key={n} className="bg-white rounded-lg border border-border/50 p-2 text-center">
                          <div className="text-[10px] font-medium text-muted-foreground">
                            {n === 1 ? "Peşin" : `${n} Taksit`}
                          </div>
                          <div className="text-xs font-bold tabular-nums text-foreground mt-0.5">
                            {formatPrice(Math.ceil(price / n))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: tablo */}
              <div className="hidden md:block rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Banka / Kart</th>
                      {INSTALLMENTS.map((n) => (
                        <th key={n} className="text-right px-3 py-2.5 font-medium text-muted-foreground whitespace-nowrap">
                          {n === 1 ? "Peşin" : `${n} Taksit`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PRIVILEGED_BANKS.map((bank, i) => (
                      <tr key={bank.name} className={i % 2 === 0 ? "bg-white" : "bg-secondary/20"}>
                        <td className="px-4 py-3">
                          <p className={`font-semibold text-xs ${bank.color}`}>{bank.name}</p>
                          <p className="text-[11px] text-muted-foreground">{bank.card}</p>
                        </td>
                        {INSTALLMENTS.map((n) => (
                          <td key={n} className="px-3 py-3 text-right">
                            <span className="font-semibold text-xs tabular-nums">
                              {formatPrice(Math.ceil(price / n))}
                            </span>
                            {n > 1 && (
                              <span className="block text-[10px] text-green-600 font-medium">
                                peşin fiyatına
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                * Toplam tutar peşin fiyatıyla aynıdır: {formatPrice(price)}
              </p>
            </div>

            {/* Vade farklı kartlar */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Diğer Kartlar (%3 Vade Farkı)</h3>

              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60">
                    <tr>
                      <th className="text-left px-3 sm:px-4 py-2.5 font-medium text-muted-foreground text-xs sm:text-sm">Taksit</th>
                      <th className="text-right px-3 sm:px-4 py-2.5 font-medium text-muted-foreground text-xs sm:text-sm">Aylık</th>
                      <th className="text-right px-3 sm:px-4 py-2.5 font-medium text-muted-foreground text-xs sm:text-sm">Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INSTALLMENTS.map((n, i) => {
                      const total = n === 1 ? price : Math.round(price * 1.03);
                      const monthly = Math.ceil(total / n);
                      return (
                        <tr key={n} className={i % 2 === 0 ? "bg-white" : "bg-secondary/20"}>
                          <td className="px-3 sm:px-4 py-2.5 font-medium text-xs sm:text-sm">
                            {n === 1 ? "Peşin" : `${n} Taksit`}
                          </td>
                          <td className="px-3 sm:px-4 py-2.5 text-right font-semibold tabular-nums text-xs sm:text-sm">
                            {formatPrice(monthly)}
                          </td>
                          <td className="px-3 sm:px-4 py-2.5 text-right text-muted-foreground tabular-nums text-xs sm:text-sm">
                            {formatPrice(total)}
                            {n > 1 && (
                              <span className="ml-1 text-[10px] text-amber-600">(+%3)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 p-3 bg-secondary/40 rounded-xl">
                <p className="text-[11px] text-muted-foreground font-medium mb-1.5">Bu tablodaki kartlar:</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {OTHER_BANKS.join(" · ")}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground border-t pt-4">
              Taksit seçenekleri bankanızın kampanya koşullarına göre değişebilir. Kampanya bilgileri için bankanızla iletişime geçiniz.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
