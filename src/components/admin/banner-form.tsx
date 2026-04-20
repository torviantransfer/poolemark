"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, Upload } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  position: string;
  starts_at: string | null;
  expires_at: string | null;
}

interface Props {
  banner?: Banner;
}

export function BannerForm({ banner }: Props) {
  const router = useRouter();
  const isEditing = !!banner;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(banner?.image_url || "");

  const [form, setForm] = useState({
    title: banner?.title || "",
    subtitle: banner?.subtitle || "",
    image_url: banner?.image_url || "",
    link_url: banner?.link_url || "",
    sort_order: banner?.sort_order?.toString() || "0",
    is_active: banner?.is_active ?? true,
    position: banner?.position || "hero",
    starts_at: banner?.starts_at ? banner.starts_at.slice(0, 16) : "",
    expires_at: banner?.expires_at ? banner.expires_at.slice(0, 16) : "",
  });

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const fileName = `banners/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("products")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      setImagePreview(urlData.publicUrl);
    } catch (err) {
      console.error(err);
      alert("Görsel yüklenirken hata oluştu.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.image_url) {
      alert("Başlık ve görsel zorunludur.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        image_url: form.image_url,
        link_url: form.link_url.trim() || null,
        sort_order: parseInt(form.sort_order) || 0,
        is_active: form.is_active,
        position: form.position,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("banners")
          .update(payload)
          .eq("id", banner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert(payload);
        if (error) throw error;
      }

      router.push("/admin/bannerlar");
      router.refresh();
    } catch (err) {
      alert("Banner kaydedilirken hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Banner Bilgileri</h3>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Başlık *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Yaz İndirimi"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Alt Başlık</label>
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => updateField("subtitle", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Tüm ürünlerde %20 indirim"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Görsel *</label>
          {imagePreview && (
            <div className="aspect-[16/7] rounded-lg overflow-hidden bg-secondary mb-2">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer bg-secondary hover:bg-secondary/80 transition-colors px-4 py-2.5 rounded-xl text-sm font-medium w-fit">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Yükleniyor..." : "Görsel Yükle"}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Link URL</label>
            <input
              type="text"
              value={form.link_url}
              onChange={(e) => updateField("link_url", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="/products"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Pozisyon</label>
            <select
              value={form.position}
              onChange={(e) => updateField("position", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="hero">Ana Slider (Hero)</option>
              <option value="sidebar">Sidebar</option>
              <option value="footer">Footer</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Sıralama</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => updateField("sort_order", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex items-end pb-2">
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
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Zamanlama (Opsiyonel)</h3>
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
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {isEditing ? "Güncelle" : "Banner Oluştur"}
      </button>
    </form>
  );
}
