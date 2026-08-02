"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Truck, X, CheckCircle2 } from "lucide-react";

const CARGO_OPTIONS = [
  { slug: "surat-kargo", name: "Sürat Kargo" },
  { slug: "yurtici-kargo", name: "Yurtiçi Kargo" },
  { slug: "ptt-kargo", name: "PTT Kargo" },
  { slug: "kolay-gelsin", name: "Kolay Gelsin" },
  { slug: "ups", name: "UPS Kargo" },
  { slug: "hepsijet", name: "HepsiJet" },
];

export function StocadoShipButton({
  orderId,
  isCod,
  orderTotal,
  existingTracking,
}: {
  orderId: string;
  isCod: boolean;
  orderTotal: number;
  existingTracking?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cargoCompanyId, setCargoCompanyId] = useState("surat-kargo");
  const [desi, setDesi] = useState("1");
  const [payOnDelivery, setPayOnDelivery] = useState(isCod);
  const [codAmount, setCodAmount] = useState(String(orderTotal || 0));
  const [result, setResult] = useState<{ trackingNumber: string; trackingUrl: string } | null>(
    null
  );

  if (existingTracking) {
    return null;
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/stocado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cargoCompanyId,
          desi: Number(desi) || 1,
          payOnDelivery,
          payOnDeliveryAmount: payOnDelivery ? Number(codAmount) || 0 : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gönderi oluşturulamadı");
      }
      setResult({ trackingNumber: data.trackingNumber, trackingUrl: data.trackingUrl });
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Gönderi oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shrink-0"
      >
        <Truck className="h-4 w-4" />
        Stocado&apos;ya Gönder
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                Stocado Kargo Oluştur
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {result ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-emerald-800">Gönderi oluşturuldu!</p>
                    <p className="text-emerald-700 mt-1">
                      Takip No: <span className="font-mono font-semibold">{result.trackingNumber || "-"}</span>
                    </p>
                    {result.trackingUrl && (
                      <a
                        href={result.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 underline break-all"
                      >
                        Takip linki
                      </a>
                    )}
                    <p className="text-emerald-700 mt-1 text-xs">
                      Müşteriye e-posta ve WhatsApp bilgilendirmesi gönderildi.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90"
                >
                  Kapat
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Kargo Firması
                  </label>
                  <select
                    value={cargoCompanyId}
                    onChange={(e) => setCargoCompanyId(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    {CARGO_OPTIONS.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Desi / Ağırlık
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={desi}
                    onChange={(e) => setDesi(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={payOnDelivery}
                      onChange={(e) => setPayOnDelivery(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Kapıda Ödeme (Tahsilatlı)
                  </label>
                  {payOnDelivery && (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={codAmount}
                      onChange={(e) => setCodAmount(e.target.value)}
                      placeholder="Tahsil edilecek tutar (TL)"
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  )}
                </div>

                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  Bu işlem gerçek ve ücretli bir kargo gönderisi oluşturur. Stocado bakiyenizden düşülür.
                </div>

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Oluşturuluyor..." : "Gönderi Oluştur"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
