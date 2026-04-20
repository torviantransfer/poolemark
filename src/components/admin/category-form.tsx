"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/helpers";
import type { Category } from "@/types";
import { Save, Upload, X, Loader2 } from "lucide-react";

interface Props {
  category?: Category;
  parentCategories: Category[];
}

export function CategoryForm({ category, parentCategories }: Props) {
  const router = useRouter();
  const isEditing = !!category;
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    image_url: category?.image_url || "",
    parent_id: category?.parent_id || "",
    sort_order: category?.sort_order?.toString() || "0",
    is_active: category?.is_active ?? true,
    meta_title: category?.meta_title || "",
    meta_description: category?.meta_description || "",
  });

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name" && !isEditing) {
      setForm((prev) => ({ ...prev, slug: slugify(value as string) }));
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const fileName = `category-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("categories")
        .upload(fileName, file, { upsert: true });

      if (error) {
        // Try products bucket as fallback
        const { error: err2 } = await supabase.storage
          .from("products")
          .upload(`categories/${fileName}`, file, { upsert: true });
        if (err2) throw err2;
        const { data: urlData } = supabase.storage
          .from("products")
          .getPublicUrl(`categories/${fileName}`);
        setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      } else {
        const { data: urlData } = supabase.storage
          .from("categories")
          .getPublicUrl(fileName);
        setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      }
    } catch (err) {
      alert("Görsel yüklenirken hata oluştu.");
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug) {
      alert("Kategori adı ve slug zorunludur.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        image_url: form.image_url || null,
        parent_id: form.parent_id || null,
        sort_order: parseInt(form.sort_order) || 0,
        is_active: form.is_active,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }

      router.push("/admin/kategoriler");
      router.refresh();
    } catch (err) {
      alert("Kategori kaydedilirken hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Name & Slug */}
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Temel Bilgiler</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Kategori Adı *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Duvar Panelleri"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="duvar-panelleri"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Açıklama</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            placeholder="Kategori açıklaması..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Üst Kategori</label>
            <select
              value={form.parent_id}
              onChange={(e) => updateField("parent_id", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Ana Kategori</option>
              {parentCategories
                .filter((c) => c.id !== category?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
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

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => updateField("is_active", e.target.checked)}
            className="rounded border-input"
          />
          <label htmlFor="is_active" className="text-sm font-medium">
            Aktif
          </label>
        </div>
      </div>

      {/* Image */}
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Görsel</h3>
        {form.image_url ? (
          <div className="relative inline-block">
            <img
              src={form.image_url}
              alt="Kategori"
              className="w-32 h-32 rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, image_url: "" }))}
              className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors">
            {uploadingImage ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Yükle</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
          </label>
        )}
      </div>

      {/* SEO */}
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <h3 className="font-semibold text-foreground">SEO</h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Meta Başlık</label>
          <input
            type="text"
            value={form.meta_title}
            onChange={(e) => updateField("meta_title", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="SEO başlığı"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Meta Açıklama</label>
          <textarea
            value={form.meta_description}
            onChange={(e) => updateField("meta_description", e.target.value)}
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            placeholder="SEO açıklaması"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isEditing ? "Güncelle" : "Kaydet"}
      </button>
    </form>
  );
}
