"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2 } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

interface Props {
  coupon?: Coupon;
}

export function CouponForm({ coupon }: Props) {
  const router = useRouter();
  const isEditing = !!coupon;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: coupon?.code || "",
    type: coupon?.type || "percentage",
    value: coupon?.value?.toString() || "",
    min_order_amount: coupon?.min_order_amount?.toString() || "",
    max_uses: coupon?.max_uses?.toString() || "",
    starts_at: coupon?.starts_at ? coupon.starts_at.slice(0, 16) : "",
    expires_at: coupon?.expires_at ? coupon.expires_at.slice(0, 16) : "",
    is_active: coupon?.is_active ?? true,
  });

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code || !form.value) {
      alert("Kupon kodu ve değer zorunludur.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const payload = {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: parseFloat(form.value),
        min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        is_active: form.is_active,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("coupons")
          .update(payload)
          .eq("id", coupon.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("coupons").insert(payload);
        if (error) throw error;
      }

      router.push("/admin/kuponlar");
      router.refresh();
    } catch (err) {
      alert("Kupon kaydedilirken hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Kupon Bilgileri</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Kupon Kodu *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => updateField("code", e.target.value.toUpperCase())}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="YENIYIL25"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">İndirim Tipi *</label>
            <select
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="percentage">Yüzde (%)</option>
              <option value="fixed_amount">Sabit Tutar (₺)</option>
              <option value="free_shipping">Ücretsiz Kargo</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              İndirim Değeri * {form.type === "percentage" ? "(%)" : form.type === "fixed_amount" ? "(₺)" : ""}
            </label>
            <input
              type="number"
              step="0.01"
              value={form.value}
              onChange={(e) => updateField("value", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={form.type === "percentage" ? "10" : "50"}
              disabled={form.type === "free_shipping"}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Minimum Sipariş Tutarı (₺)</label>
            <input
              type="number"
              step="0.01"
              value={form.min_order_amount}
              onChange={(e) => updateField("min_order_amount", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="100"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Maksimum Kullanım</label>
          <input
            type="number"
            value={form.max_uses}
            onChange={(e) => updateField("max_uses", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Sınırsız bırakmak için boş bırakın"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Geçerlilik</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Başlangıç Tarihi</label>
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => updateField("starts_at", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bitiş Tarihi</label>
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => updateField("expires_at", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => updateField("is_active", e.target.checked)}
            className="rounded border-input"
          />
          <label htmlFor="is_active" className="text-sm font-medium">Aktif</label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {isEditing ? "Güncelle" : "Kupon Oluştur"}
      </button>
    </form>
  );
}
