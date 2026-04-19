"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/helpers";
import type { Product, Category } from "@/types";
import { Save, Upload, X, Loader2 } from "lucide-react";

interface Props {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(
    product?.images?.sort((a, b) => a.sort_order - b.sort_order).map((i) => i.url) || []
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    short_description: product?.short_description || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    price: product?.price?.toString() || "",
    compare_at_price: product?.compare_at_price?.toString() || "",
    cost_price: product?.cost_price?.toString() || "",
    stock_quantity: product?.stock_quantity?.toString() || "0",
    low_stock_threshold: product?.low_stock_threshold?.toString() || "5",
    weight: product?.weight?.toString() || "",
    category_id: product?.category_id || "",
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    meta_title: product?.meta_title || "",
    meta_description: product?.meta_description || "",
  });

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name" && !isEditing) {
      setForm((prev) => ({ ...prev, slug: slugify(value as string) }));
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploadingImage(true);
    try {
      const supabase = createClient();
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);
        if (error) throw error;

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        setImages((prev) => [...prev, data.publicUrl]);
      }
    } catch {
      alert("Resim yükleme başarısız oldu.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price || !form.category_id) {
      alert("Lütfen zorunlu alanları doldurun.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const productData = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || null,
        short_description: form.short_description || null,
        sku: form.sku || null,
        barcode: form.barcode || null,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
        stock_quantity: parseInt(form.stock_quantity),
        low_stock_threshold: parseInt(form.low_stock_threshold),
        weight: form.weight ? parseFloat(form.weight) : null,
        category_id: form.category_id,
        is_active: form.is_active,
        is_featured: form.is_featured,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
      };

      let productId = product?.id;

      if (isEditing && productId) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(productData)
          .select("id")
          .single();
        if (error) throw error;
        productId = data.id;
      }

      // Update images
      if (productId) {
        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId);

        if (images.length > 0) {
          const imageRows = images.map((url, index) => ({
            product_id: productId!,
            url,
            sort_order: index,
            is_primary: index === 0,
          }));
          await supabase.from("product_images").insert(imageRows);
        }
      }

      router.push("/admin/urunler");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Kaydetme başarısız oldu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold">Temel Bilgiler</h2>
            <FormField
              label="Ürün Adı *"
              value={form.name}
              onChange={(v) => updateField("name", v)}
              placeholder="Ürün adını girin"
            />
            <FormField
              label="Slug"
              value={form.slug}
              onChange={(v) => updateField("slug", v)}
              placeholder="urun-adi"
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Kısa Açıklama
              </label>
              <textarea
                value={form.short_description}
                onChange={(e) => updateField("short_description", e.target.value)}
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Kısa ürün açıklaması"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Detaylı Açıklama
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={6}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                placeholder="Ürünün detaylı açıklaması"
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold">Görseller</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((url, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover rounded-xl border"
                  />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md font-medium">
                      Ana
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white/90 text-destructive rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                {uploadingImage ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Ekle</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold">Fiyatlandırma</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <FormField
                label="Satış Fiyatı *"
                value={form.price}
                onChange={(v) => updateField("price", v)}
                type="number"
                placeholder="0.00"
              />
              <FormField
                label="Karşılaştırma Fiyatı"
                value={form.compare_at_price}
                onChange={(v) => updateField("compare_at_price", v)}
                type="number"
                placeholder="0.00"
              />
              <FormField
                label="Maliyet Fiyatı"
                value={form.cost_price}
                onChange={(v) => updateField("cost_price", v)}
                type="number"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold">Stok & Envanter</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                label="SKU"
                value={form.sku}
                onChange={(v) => updateField("sku", v)}
                placeholder="SKU-001"
              />
              <FormField
                label="Barkod"
                value={form.barcode}
                onChange={(v) => updateField("barcode", v)}
                placeholder="8680000000000"
              />
              <FormField
                label="Stok Miktarı"
                value={form.stock_quantity}
                onChange={(v) => updateField("stock_quantity", v)}
                type="number"
                placeholder="0"
              />
              <FormField
                label="Düşük Stok Eşiği"
                value={form.low_stock_threshold}
                onChange={(v) => updateField("low_stock_threshold", v)}
                type="number"
                placeholder="5"
              />
            </div>
            <FormField
              label="Ağırlık (g)"
              value={form.weight}
              onChange={(v) => updateField("weight", v)}
              type="number"
              placeholder="0"
            />
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold">SEO</h2>
            <FormField
              label="Meta Başlık"
              value={form.meta_title}
              onChange={(v) => updateField("meta_title", v)}
              placeholder="Sayfa başlığı"
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Meta Açıklama
              </label>
              <textarea
                value={form.meta_description}
                onChange={(e) => updateField("meta_description", e.target.value)}
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Sayfa açıklaması (SEO)"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold">Durum</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateField("is_active", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Aktif (Yayında)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => updateField("is_featured", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Öne Çıkan Ürün</span>
            </label>
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold">Kategori *</h2>
            <select
              value={form.category_id}
              onChange={(e) => updateField("category_id", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="">Kategori seçin</option>
              {categories.map((cat) => (
                <optgroup key={cat.id} label={cat.name}>
                  <option value={cat.id}>{cat.name}</option>
                  {cat.children?.map((child) => (
                    <option key={child.id} value={child.id}>
                      — {child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEditing ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={type === "number" ? "0.01" : undefined}
        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </div>
  );
}
