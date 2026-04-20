"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2 } from "lucide-react";

interface Announcement {
  id: string;
  text: string;
  link_url: string | null;
  bg_color: string;
  text_color: string;
  is_active: boolean;
  sort_order: number;
}

interface Props {
  announcement?: Announcement;
}

export function AnnouncementForm({ announcement }: Props) {
  const router = useRouter();
  const isEditing = !!announcement;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    text: announcement?.text || "",
    link_url: announcement?.link_url || "",
    bg_color: announcement?.bg_color || "#22C55E",
    text_color: announcement?.text_color || "#FFFFFF",
    is_active: announcement?.is_active ?? true,
    sort_order: announcement?.sort_order?.toString() || "0",
  });

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.text) {
      alert("Duyuru mesajı zorunludur.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const payload = {
        text: form.text.trim(),
        link_url: form.link_url.trim() || null,
        bg_color: form.bg_color,
        text_color: form.text_color,
        is_active: form.is_active,
        sort_order: parseInt(form.sort_order) || 0,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("announcements")
          .update(payload)
          .eq("id", announcement.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("announcements").insert(payload);
        if (error) throw error;
      }

      router.push("/admin/duyurular");
      router.refresh();
    } catch (err) {
      alert("Duyuru kaydedilirken hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Duyuru Bilgileri</h3>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Mesaj *</label>
          <input
            type="text"
            value={form.text}
            onChange={(e) => updateField("text", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="🚚 400₺ üzeri siparişlerde ücretsiz kargo!"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Link URL (Opsiyonel)</label>
          <input
            type="text"
            value={form.link_url}
            onChange={(e) => updateField("link_url", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="/products"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Arka Plan Rengi</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.bg_color}
                onChange={(e) => updateField("bg_color", e.target.value)}
                className="h-10 w-10 rounded-md border border-input cursor-pointer"
              />
              <input
                type="text"
                value={form.bg_color}
                onChange={(e) => updateField("bg_color", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Yazı Rengi</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.text_color}
                onChange={(e) => updateField("text_color", e.target.value)}
                className="h-10 w-10 rounded-md border border-input cursor-pointer"
              />
              <input
                type="text"
                value={form.text_color}
                onChange={(e) => updateField("text_color", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Sıralama</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => updateField("sort_order", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Önizleme</label>
          <div
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-center"
            style={{ backgroundColor: form.bg_color, color: form.text_color }}
          >
            {form.text || "Duyuru mesajı buraya gelecek"}
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
        {isEditing ? "Güncelle" : "Duyuru Oluştur"}
      </button>
    </form>
  );
}
