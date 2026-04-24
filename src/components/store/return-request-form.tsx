"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";

export function ReturnRequestForm({
  orderId,
  existingStatus,
}: {
  orderId: string;
  existingStatus?: string | null;
}) {
  const [reason, setReason] = useState("beden_uyumsuzlugu");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/returns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: data.error || "İade talebi oluşturulamadı." });
      } else {
        setResult({ ok: true, message: "İade talebiniz oluşturuldu." });
      }
    } catch {
      setResult({ ok: false, message: "Bir hata oluştu. Lütfen tekrar deneyin." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <RotateCcw className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">İade Talebi</h3>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">14 gün içinde kolay iade süreciyle talebinizi güvenle oluşturabilirsiniz.</p>

      {existingStatus ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Bu sipariş için mevcut bir iade talebi bulunuyor: <span className="font-semibold">{existingStatus}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">İade Nedeni</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
            >
              <option value="beden_uyumsuzlugu">Ürün beklentimi karşılamadı</option>
              <option value="hasarli_urun">Hasarlı ürün</option>
              <option value="yanlis_urun">Yanlış ürün gönderimi</option>
              <option value="diger">Diğer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Kısa bir açıklama yazın"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Güvenli İade Talebi Oluştur
          </button>
        </form>
      )}

      {result && (
        <p
          className={`text-sm rounded-lg px-3 py-2 ${
            result.ok
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-destructive/5 text-destructive border border-destructive/10"
          }`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
