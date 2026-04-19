"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/helpers";
import type { Page } from "@/types";
import { Save, Loader2 } from "lucide-react";

export function PageForm({ page }: { page?: Page }) {
  const router = useRouter();
  const isEditing = !!page;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: page?.title || "",
    slug: page?.slug || "",
    content: page?.content || "",
    is_active: page?.is_active ?? true,
    meta_title: page?.meta_title || "",
    meta_description: page?.meta_description || "",
  });

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "title" && !isEditing) {
      setForm((prev) => ({ ...prev, slug: slugify(value as string) }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return alert("Başlık zorunludur.");
    setLoading(true);
    try {
      const supabase = createClient();
      const data = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        content: form.content || null,
        is_active: form.is_active,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
      };
      if (isEditing) {
        await supabase.from("pages").update(data).eq("id", page!.id);
      } else {
        await supabase.from("pages").insert(data);
      }
      router.push("/admin/sayfalar");
      router.refresh();
    } catch {
      alert("Kaydetme başarısız oldu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Başlık *</label>
              <input type="text" value={form.title} onChange={(e) => updateField("title", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">İçerik</label>
              <textarea value={form.content} onChange={(e) => updateField("content", e.target.value)} rows={15} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y font-mono" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => updateField("is_active", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="text-sm">Yayında</span>
            </label>
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEditing ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
