"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/helpers";
import type { Product, Category, ProductVariant } from "@/types";
import {
  Save,
  Upload,
  X,
  Loader2,
  Plus,
  Trash2,
  Tag,
  Image as ImageIcon,
  DollarSign,
  Package,
  Layers,
  Search,
  CheckCircle2,
  Star,
} from "lucide-react";

interface VariantDraft {
  id?: string;
  name: string;
  sku: string;
  price: string;
  stock_quantity: string;
  image_url: string;
  sort_order: number;
}

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

  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku || "",
        price: v.price.toString(),
        stock_quantity: v.stock_quantity.toString(),
        image_url: v.image_url || "",
        sort_order: v.sort_order,
      })) || []
  );

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

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        name: "",
        sku: "",
        price: form.price || "0",
        stock_quantity: "0",
        image_url: "",
        sort_order: prev.length,
      },
    ]);
  }

  function updateVariant(index: number, field: keyof VariantDraft, value: string) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
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

      if (productId) {
        await supabase.from("product_images").delete().eq("product_id", productId);
        if (images.length > 0) {
          await supabase.from("product_images").insert(
            images.map((url, index) => ({
              product_id: productId!,
              url,
              sort_order: index,
              is_primary: index === 0,
            }))
          );
        }
      }

      if (productId) {
        await supabase.from("product_variants").delete().eq("product_id", productId);
        if (variants.length > 0) {
          await supabase.from("product_variants").insert(
            variants.map((v, index) => ({
              product_id: productId!,
              name: v.name,
              sku: v.sku || null,
              price: parseFloat(v.price) || 0,
              stock_quantity: parseInt(v.stock_quantity) || 0,
              image_url: v.image_url || null,
              sort_order: index,
            }))
          );
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

  const selectedCategory = categories
    .flatMap((c) => [c, ...(c.children || [])])
    .find((c) => c.id === form.category_id);

  const margin =
    form.price && form.cost_price
      ? Math.round(
          ((parseFloat(form.price) - parseFloat(form.cost_price)) /
            parseFloat(form.price)) *
            100
        )
      : null;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* ── Left column (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Temel Bilgiler */}
          <Section icon={<Tag className="h-4 w-4" />} title="Temel Bilgiler">
            <Field label="Ürün Adı *">
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Ürün adını girin"
                className={inputCls}
              />
            </Field>
            <Field label="Slug">
              <div className="flex items-center rounded-lg border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden">
                <span className="px-3 py-2 text-xs text-muted-foreground bg-secondary border-r select-none">
                  /products/
                </span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="urun-adi"
                  className="flex-1 px-3 py-2 text-sm bg-white focus:outline-none"
                />
              </div>
            </Field>
            <Field label="Kısa Açıklama">
              <textarea
                value={form.short_description}
                onChange={(e) => updateField("short_description", e.target.value)}
                rows={2}
                className={`${inputCls} resize-none`}
                placeholder="Kısa ürün açıklaması"
              />
            </Field>
            <Field label="Detaylı Açıklama">
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={8}
                className={`${inputCls} resize-y`}
                placeholder="Ürünün detaylı açıklaması"
              />
            </Field>
          </Section>

          {/* Görseller */}
          <Section
            icon={<ImageIcon className="h-4 w-4" />}
            title="Görseller"
            badge={images.length > 0 ? `${images.length} görsel` : undefined}
          >
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-3">
              {images.map((url, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover rounded-xl border"
                  />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-semibold leading-none">
                      ANA
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white/95 text-destructive rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
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
                    <Upload className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-[11px] text-muted-foreground font-medium">Ekle</span>
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
            <p className="text-xs text-muted-foreground">
              İlk görsel ana görsel olarak kullanılır. Sürükleyerek sıralayabilirsiniz.
            </p>
          </Section>

          {/* Fiyatlandırma */}
          <Section icon={<DollarSign className="h-4 w-4" />} title="Fiyatlandırma">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Satış Fiyatı *">
                <PriceInput
                  value={form.price}
                  onChange={(v) => updateField("price", v)}
                  placeholder="0,00"
                />
              </Field>
              <Field label="Karşılaştırma Fiyatı">
                <PriceInput
                  value={form.compare_at_price}
                  onChange={(v) => updateField("compare_at_price", v)}
                  placeholder="0,00"
                />
              </Field>
              <Field label="Maliyet Fiyatı">
                <PriceInput
                  value={form.cost_price}
                  onChange={(v) => updateField("cost_price", v)}
                  placeholder="0,00"
                />
              </Field>
            </div>
            {margin !== null && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Brüt kar marjı:</span>
                <span
                  className={`font-semibold ${
                    margin >= 40
                      ? "text-green-600"
                      : margin >= 20
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  %{margin}
                </span>
              </div>
            )}
          </Section>

          {/* Stok */}
          <Section icon={<Package className="h-4 w-4" />} title="Stok & Envanter">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="SKU">
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => updateField("sku", e.target.value)}
                  placeholder="SKU-001"
                  className={inputCls}
                />
              </Field>
              <Field label="Barkod">
                <input
                  type="text"
                  value={form.barcode}
                  onChange={(e) => updateField("barcode", e.target.value)}
                  placeholder="8680000000000"
                  className={inputCls}
                />
              </Field>
              <Field label="Stok Miktarı">
                <input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) => updateField("stock_quantity", e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </Field>
              <Field label="Düşük Stok Eşiği">
                <input
                  type="number"
                  value={form.low_stock_threshold}
                  onChange={(e) => updateField("low_stock_threshold", e.target.value)}
                  placeholder="5"
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="w-40">
              <Field label="Ağırlık (g)">
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => updateField("weight", e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          {/* Varyasyonlar */}
          <Section
            icon={<Layers className="h-4 w-4" />}
            title="Varyasyonlar"
            badge={variants.length > 0 ? `${variants.length} varyasyon` : undefined}
            action={
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Varyasyon Ekle
              </button>
            }
          >
            {variants.length === 0 ? (
              <div className="border-2 border-dashed rounded-xl py-8 flex flex-col items-center justify-center gap-2">
                <Layers className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Henüz varyasyon eklenmedi</p>
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  + İlk varyasyonu ekle
                </button>
              </div>
            ) : (
              <div className="rounded-xl border overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_100px_100px_80px_auto] gap-0 bg-secondary/50 border-b text-xs font-medium text-muted-foreground">
                  <div className="px-3 py-2.5">Ad / SKU</div>
                  <div className="px-3 py-2.5 text-right">Fiyat (₺)</div>
                  <div className="px-3 py-2.5 text-right">Stok</div>
                  <div className="px-3 py-2.5 text-center">Görsel</div>
                  <div className="px-3 py-2.5 w-10" />
                </div>
                {variants.map((v, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_100px_100px_80px_auto] gap-0 border-b last:border-0 hover:bg-secondary/20 transition-colors"
                  >
                    {/* Ad / SKU */}
                    <div className="px-3 py-2 space-y-1.5">
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => updateVariant(index, "name", e.target.value)}
                        placeholder="Örn: Beyaz / L / 38cm"
                        className="w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => updateVariant(index, "sku", e.target.value)}
                        placeholder="SKU"
                        className="w-full rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    {/* Fiyat */}
                    <div className="px-3 py-2 flex items-start pt-3">
                      <div className="flex items-center rounded-md border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden w-full">
                        <span className="px-2 py-1.5 text-xs text-muted-foreground bg-secondary border-r">₺</span>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => updateVariant(index, "price", e.target.value)}
                          placeholder="0"
                          step="0.01"
                          className="flex-1 px-2 py-1.5 text-sm bg-white focus:outline-none w-0"
                        />
                      </div>
                    </div>
                    {/* Stok */}
                    <div className="px-3 py-2 flex items-start pt-3">
                      <input
                        type="number"
                        value={v.stock_quantity}
                        onChange={(e) => updateVariant(index, "stock_quantity", e.target.value)}
                        placeholder="0"
                        className="w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-right"
                      />
                    </div>
                    {/* Görsel */}
                    <div className="px-3 py-2 flex items-start pt-2.5 justify-center">
                      {v.image_url ? (
                        <div className="relative group w-10 h-10 shrink-0">
                          <img
                            src={v.image_url}
                            alt=""
                            className="w-full h-full object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => updateVariant(index, "image_url", "")}
                            className="absolute -top-1 -right-1 bg-white text-destructive rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative group">
                          <label
                            htmlFor={`variant-img-${index}`}
                            className="w-10 h-10 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                            title="URL girin"
                          >
                            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          </label>
                          {/* URL tooltip input */}
                          <input
                            id={`variant-img-${index}`}
                            type="text"
                            value={v.image_url}
                            onChange={(e) => updateVariant(index, "image_url", e.target.value)}
                            placeholder="https://..."
                            className="absolute z-10 top-12 right-0 w-64 rounded-lg border shadow-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white opacity-0 group-focus-within:opacity-100 pointer-events-none group-focus-within:pointer-events-auto transition-opacity"
                          />
                        </div>
                      )}
                    </div>
                    {/* Sil */}
                    <div className="px-2 py-2 flex items-start pt-3 w-10">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {/* Footer total */}
                <div className="px-3 py-2 bg-secondary/30 text-xs text-muted-foreground flex items-center justify-between border-t">
                  <span>{variants.length} varyasyon</span>
                  <span>
                    Toplam stok:{" "}
                    <strong className="text-foreground">
                      {variants.reduce((s, v) => s + (parseInt(v.stock_quantity) || 0), 0)}
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </Section>

          {/* SEO */}
          <Section icon={<Search className="h-4 w-4" />} title="SEO">
            <Field label="Meta Başlık">
              <div className="relative">
                <input
                  type="text"
                  value={form.meta_title}
                  onChange={(e) => updateField("meta_title", e.target.value)}
                  placeholder="Sayfa başlığı (60 karakter önerilir)"
                  maxLength={80}
                  className={inputCls}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {form.meta_title.length}/80
                </span>
              </div>
            </Field>
            <Field label="Meta Açıklama">
              <div className="relative">
                <textarea
                  value={form.meta_description}
                  onChange={(e) => updateField("meta_description", e.target.value)}
                  rows={3}
                  maxLength={200}
                  className={`${inputCls} resize-none pr-12`}
                  placeholder="Sayfa açıklaması (160 karakter önerilir)"
                />
                <span className="absolute right-3 bottom-2.5 text-xs text-muted-foreground">
                  {form.meta_description.length}/200
                </span>
              </div>
            </Field>
            {/* Preview */}
            {(form.meta_title || form.meta_description) && (
              <div className="rounded-xl border p-4 bg-secondary/30 space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                  Google Önizleme
                </p>
                <p className="text-[15px] text-blue-600 font-medium leading-snug line-clamp-1">
                  {form.meta_title || form.name || "Sayfa Başlığı"}
                </p>
                <p className="text-xs text-green-700">
                  poolemark.com/products/{form.slug || "urun-adi"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {form.meta_description || "Meta açıklama buraya gelecek..."}
                </p>
              </div>
            )}
          </Section>
        </div>

        {/* ── Right sidebar (1/3) – sticky ── */}
        <div className="space-y-4 lg:sticky lg:top-6">

          {/* Kaydet */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEditing ? "Değişiklikleri Kaydet" : "Ürünü Yayınla"}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              {isEditing
                ? "Tüm değişiklikler anında yayına alınır"
                : "Kaydettiğinizde ürün mağazada görünür"}
            </p>
          </div>

          {/* Durum */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Durum</h3>
            </div>
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="text-sm font-medium">Aktif</p>
                <p className="text-xs text-muted-foreground">Mağazada görünsün</p>
              </div>
              <Toggle
                checked={form.is_active}
                onChange={(v) => updateField("is_active", v)}
                color="green"
              />
            </label>
            <div className="h-px bg-border" />
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="text-sm font-medium">Öne Çıkan</p>
                <p className="text-xs text-muted-foreground">Ana sayfada göster</p>
              </div>
              <Toggle
                checked={form.is_featured}
                onChange={(v) => updateField("is_featured", v)}
                color="amber"
              />
            </label>
          </div>

          {/* Kategori */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold">Kategori *</h3>
            <select
              value={form.category_id}
              onChange={(e) => updateField("category_id", e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
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
            {selectedCategory && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                {selectedCategory.name}
              </p>
            )}
          </div>

          {/* Özet */}
          {isEditing && (
            <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Özet
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fiyat</span>
                  <span className="font-semibold">
                    {form.price ? `₺${parseFloat(form.price).toLocaleString("tr-TR")}` : "—"}
                  </span>
                </div>
                {form.compare_at_price && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">İndirim</span>
                    <span className="font-semibold text-green-600">
                      %
                      {Math.round(
                        (1 -
                          parseFloat(form.price) /
                            parseFloat(form.compare_at_price)) *
                          100
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stok</span>
                  <span
                    className={`font-semibold ${
                      parseInt(form.stock_quantity) === 0
                        ? "text-red-600"
                        : parseInt(form.stock_quantity) < parseInt(form.low_stock_threshold)
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  >
                    {form.stock_quantity} adet
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Varyasyon</span>
                  <span className="font-semibold">{variants.length} adet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Görsel</span>
                  <span className="font-semibold">{images.length} adet</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

/* ── Helpers ──────────────────────────────────────────── */

const inputCls =
  "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white";

function Section({
  icon,
  title,
  badge,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-secondary/30">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {badge && (
            <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function PriceInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center rounded-lg border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden">
      <span className="px-3 py-2 text-sm font-medium text-muted-foreground bg-secondary border-r select-none">
        ₺
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step="0.01"
        className="flex-1 px-3 py-2 text-sm bg-white focus:outline-none"
      />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  color = "green",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: "green" | "amber";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
        checked
          ? color === "amber"
            ? "bg-amber-400"
            : "bg-green-500"
          : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}


interface VariantDraft {
  id?: string; // existing variant
  name: string;
  sku: string;
  price: string;
  stock_quantity: string;
  image_url: string;
  sort_order: number;
}

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

  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku || "",
        price: v.price.toString(),
        stock_quantity: v.stock_quantity.toString(),
        image_url: v.image_url || "",
        sort_order: v.sort_order,
      })) || []
  );

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

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        name: "",
        sku: "",
        price: form.price || "0",
        stock_quantity: "0",
        image_url: "",
        sort_order: prev.length,
      },
    ]);
  }

  function updateVariant(index: number, field: keyof VariantDraft, value: string) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
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

      // Update variants
      if (productId) {
        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", productId);

        if (variants.length > 0) {
          const variantRows = variants.map((v, index) => ({
            product_id: productId!,
            name: v.name,
            sku: v.sku || null,
            price: parseFloat(v.price) || 0,
            stock_quantity: parseInt(v.stock_quantity) || 0,
            image_url: v.image_url || null,
            sort_order: index,
          }));
          await supabase.from("product_variants").insert(variantRows);
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

          {/* Variants */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Varyasyonlar</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Renk, beden, boyut gibi ürün seçenekleri ekleyin
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Varyasyon Ekle
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="border-2 border-dashed rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Henüz varyasyon eklenmedi
                </p>
                <button
                  type="button"
                  onClick={addVariant}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  İlk varyasyonu ekle
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((v, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-4 space-y-3 bg-secondary/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Varyasyon {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-1 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          Ad *
                        </label>
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => updateVariant(index, "name", e.target.value)}
                          placeholder="Örn: Mavi / L / 38cm"
                          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => updateVariant(index, "sku", e.target.value)}
                          placeholder="SKU-001-L"
                          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          Fiyat (₺)
                        </label>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => updateVariant(index, "price", e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          Stok
                        </label>
                        <input
                          type="number"
                          value={v.stock_quantity}
                          onChange={(e) =>
                            updateVariant(index, "stock_quantity", e.target.value)
                          }
                          placeholder="0"
                          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Görsel URL (opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={v.image_url}
                        onChange={(e) => updateVariant(index, "image_url", e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
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
