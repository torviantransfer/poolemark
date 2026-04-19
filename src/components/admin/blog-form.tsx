"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/helpers";
import type { BlogPost } from "@/types";
import { Save, Upload, Loader2 } from "lucide-react";

interface Props {
  post?: BlogPost;
}

export function BlogPostForm({ post }: Props) {
  const router = useRouter();
  const isEditing = !!post;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    content: post?.content || "",
    excerpt: post?.excerpt || "",
    cover_image_url: post?.cover_image_url || "",
    is_published: post?.is_published ?? false,
    meta_title: post?.meta_title || "",
    meta_description: post?.meta_description || "",
  });

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "title" && !isEditing) {
      setForm((prev) => ({ ...prev, slug: slugify(value as string) }));
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const fileName = `blog/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("blog-images").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("blog-images").getPublicUrl(fileName);
      updateField("cover_image_url", data.publicUrl);
    } catch {
      alert("Resim yükleme başarısız oldu.");
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
        excerpt: form.excerpt || null,
        cover_image_url: form.cover_image_url || null,
        is_published: form.is_published,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
      };

      if (isEditing) {
        await supabase.from("blog_posts").update(data).eq("id", post!.id);
      } else {
        await supabase.from("blog_posts").insert(data);
      }
      router.push("/admin/blog");
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
            <h2 className="text-base font-semibold">İçerik</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5">Başlık *</label>
              <input type="text" value={form.title} onChange={(e) => updateField("title", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Yazı başlığı" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="yazi-basligi" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Özet</label>
              <textarea value={form.excerpt} onChange={(e) => updateField("excerpt", e.target.value)} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="Kısa özet" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">İçerik</label>
              <textarea value={form.content} onChange={(e) => updateField("content", e.target.value)} rows={12} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y font-mono" placeholder="HTML veya metin içerik" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold">SEO</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5">Meta Başlık</label>
              <input type="text" value={form.meta_title} onChange={(e) => updateField("meta_title", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Meta Açıklama</label>
              <textarea value={form.meta_description} onChange={(e) => updateField("meta_description", e.target.value)} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold">Yayın</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_published} onChange={(e) => updateField("is_published", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="text-sm">Yayında</span>
            </label>

          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold">Kapak Görseli</h2>
            {form.cover_image_url && (
              <img src={form.cover_image_url} alt="" className="w-full aspect-video rounded-xl object-cover" />
            )}
            <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors text-sm text-muted-foreground">
              <Upload className="h-4 w-4" />
              Görsel Yükle
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEditing ? "Güncelle" : "Yayınla"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
