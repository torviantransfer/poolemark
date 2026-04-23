"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, Upload, X } from "lucide-react";

interface ShippingCompany {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  price: number;
  free_shipping_threshold: number | null;
  estimated_days: string | null;
  tracking_url_template: string | null;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  company?: ShippingCompany;
}

function slugifyCode(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ShippingCompanyForm({ company }: Props) {
  const router = useRouter();
  const isEditing = !!company;
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(company?.logo_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: company?.name || "",
    code: company?.code || "",
    logo_url: company?.logo_url || "",
    price: company?.price?.toString() || "",
    free_shipping_threshold: company?.free_shipping_threshold?.toString() || "500",
    estimated_days: company?.estimated_days || "1-3 İş Günü",
    tracking_url_template: company?.tracking_url_template || "",
    sort_order: company?.sort_order?.toString() || "0",
    is_active: company?.is_active ?? true,
  });

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    // logo_url'i temizle — yüklenen dosya kullanılacak
    updateField("logo_url", "");
  }

  function clearLogo() {
    setLogoFile(null);
    setLogoPreview("");
    updateField("logo_url", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      alert("Firma adı ve kod zorunludur.");
      return;
    }

    const parsedPrice = parseFloat(form.price || "0");
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      alert("Geçerli bir kargo ücreti girin.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      let finalLogoUrl = form.logo_url.trim() || null;

      // Dosya yüklendiyse Supabase Storage'a yükle
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `${slugifyCode(form.code)}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("cargo-logos")
          .upload(path, logoFile, { upsert: true, contentType: logoFile.type });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("cargo-logos").getPublicUrl(path);
        finalLogoUrl = urlData.publicUrl;
      }

      const payload = {
        name: form.name.trim(),
        code: slugifyCode(form.code),
        logo_url: finalLogoUrl,
        price: parsedPrice,
        free_shipping_threshold: form.free_shipping_threshold
          ? parseFloat(form.free_shipping_threshold)
          : null,
        estimated_days: form.estimated_days.trim() || null,
        tracking_url_template: form.tracking_url_template.trim() || null,
        sort_order: parseInt(form.sort_order || "0", 10),
        is_active: form.is_active,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("shipping_companies")
          .update(payload)
          .eq("id", company.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("shipping_companies").insert(payload);
        if (error) throw error;
      }

      router.push("/admin/kargolar");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Kargo firması kaydedilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Firma Bilgileri</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Firma Adı *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Yurtiçi Kargo"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Kod *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => updateField("code", slugifyCode(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="yurtici"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Kargo Ücreti (₺)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="39.90"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ücretsiz Kargo Eşiği (₺)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.free_shipping_threshold}
              onChange={(e) => updateField("free_shipping_threshold", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tahmini Teslimat</label>
            <input
              type="text"
              value={form.estimated_days}
              onChange={(e) => updateField("estimated_days", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="1-3 İş Günü"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Sıralama</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => updateField("sort_order", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Takip URL Şablonu</label>
          <input
            type="text"
            value={form.tracking_url_template}
            onChange={(e) => updateField("tracking_url_template", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="https://kargo.com/takip/{tracking_number}"
          />
          <p className="text-xs text-muted-foreground">
            Takip numarası için <span className="font-mono">{"{tracking_number}"}</span> kullanın.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Logo</label>
          <div className="flex items-start gap-3">
            {/* Önizleme */}
            {logoPreview && (
              <div className="relative shrink-0 flex items-center justify-center w-24 h-14 rounded-lg border bg-secondary/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreview}
                  alt="Logo önizleme"
                  className="max-h-10 max-w-[88px] object-contain"
                />
                <button
                  type="button"
                  onClick={clearLogo}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {/* Yükleme butonu */}
            <div className="flex-1 space-y-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoFileChange}
                className="hidden"
                id="logo-file-input"
              />
              <label
                htmlFor="logo-file-input"
                className="inline-flex items-center gap-2 cursor-pointer h-10 rounded-md border border-dashed border-input px-4 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
              >
                <Upload className="w-4 h-4" />
                {logoFile ? logoFile.name : "PNG / JPG / SVG seç"}
              </label>
              <p className="text-xs text-muted-foreground">
                Logo yüklenmezse <span className="font-mono">/shipping/{form.code || "kod"}.png</span> otomatik kullanılır.
              </p>
            </div>
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
        {isEditing ? "Güncelle" : "Kargo Firması Oluştur"}
      </button>
    </form>
  );
}
