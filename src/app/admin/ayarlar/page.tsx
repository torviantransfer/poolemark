"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2 } from "lucide-react";

interface Setting {
  id: string;
  key: string;
  value: string;
}

type SettingFieldType = "text" | "email" | "textarea" | "url" | "number" | "checkbox";

type SettingDefinition = {
  key: string;
  label: string;
  type: SettingFieldType;
  defaultValue: string;
};

const DEFAULT_SETTINGS = [
  { key: "site_name", label: "Site Adı", type: "text", defaultValue: "" },
  { key: "site_description", label: "Site Açıklaması", type: "text", defaultValue: "" },
  { key: "contact_email", label: "İletişim E-postası", type: "email", defaultValue: "" },
  { key: "contact_phone", label: "İletişim Telefonu", type: "text", defaultValue: "" },
  { key: "contact_address", label: "Adres", type: "textarea", defaultValue: "" },
  { key: "whatsapp_number", label: "WhatsApp Numarası", type: "text", defaultValue: "" },
  { key: "instagram_url", label: "Instagram URL", type: "url", defaultValue: "" },
  { key: "facebook_url", label: "Facebook URL", type: "url", defaultValue: "" },
  { key: "twitter_url", label: "Twitter / X URL", type: "url", defaultValue: "" },
  { key: "free_shipping_threshold", label: "Ücretsiz Kargo Limiti (₺)", type: "number", defaultValue: "" },
  { key: "shipping_cost", label: "Kargo Ücreti (₺)", type: "number", defaultValue: "" },
  { key: "meta_title", label: "Ana Sayfa Meta Başlık", type: "text", defaultValue: "" },
  { key: "meta_description", label: "Ana Sayfa Meta Açıklama", type: "textarea", defaultValue: "" },
  { key: "newsletter_welcome_coupon_enabled", label: "Newsletter Hoşgeldin Kuponu Aktif", type: "checkbox", defaultValue: "false" },
  { key: "newsletter_welcome_coupon_code", label: "Newsletter Hoşgeldin Kupon Kodu", type: "text", defaultValue: "HOSGELDIN10" },
  { key: "cod_enabled", label: "Kapıda Ödeme Aktif", type: "checkbox", defaultValue: "false" },
  { key: "cod_fee", label: "Kapıda Ödeme Hizmet Bedeli (₺)", type: "number", defaultValue: "0" },
  { key: "cod_min_amount", label: "Kapıda Ödeme Min. Sepet Tutarı (₺, 0 = sınırsız)", type: "number", defaultValue: "0" },
  { key: "cod_max_amount", label: "Kapıda Ödeme Maks. Sepet Tutarı (₺, 0 = sınırsız)", type: "number", defaultValue: "0" },
  { key: "cod_online_discount_percent", label: "Online Ödeme İndirimi (%, kapıda ödemeyi caydırmak için)", type: "number", defaultValue: "0" },
  { key: "cod_whatsapp_confirmation", label: "Kapıda Ödeme WhatsApp Onayı Aktif", type: "checkbox", defaultValue: "true" },
] as const satisfies readonly SettingDefinition[];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const supabase = createClient();
    const { data } = await supabase.from("site_settings").select("*");
    const map: Record<string, string> = DEFAULT_SETTINGS.reduce((acc, def) => {
      acc[def.key] = def.defaultValue;
      return acc;
    }, {} as Record<string, string>);

    // site_settings.value bir jsonb kolonu: boolean/number olarak da dönebilir.
    // Supabase-js jsonb'yi otomatik parse ettiği için burada string'e normalize ediyoruz,
    // aksi halde checkbox karşılaştırmaları (=== "true") yanlış çalışır.
    data?.forEach((s: Setting) => {
      const raw = s.value as unknown;
      map[s.key] = raw === null || raw === undefined ? "" : String(raw);
    });
    setSettings(map);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      for (const [key, value] of Object.entries(settings)) {
        const { data, error } = await supabase
          .from("site_settings")
          .upsert({ key, value }, { onConflict: "key" })
          .select("id");
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error(`"${key}" ayarı kaydedilemedi. Yetkiniz olmayabilir.`);
        }
      }
      alert("Ayarlar kaydedildi.");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Kaydetme başarısız oldu.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between rounded-2xl border bg-white/90 backdrop-blur shadow-sm px-5 py-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ayarlar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Site genel ayarları
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet
        </button>
      </div>

      <div className="bg-white/90 backdrop-blur rounded-2xl border shadow-sm p-5 space-y-5">
        {DEFAULT_SETTINGS.map((def) => (
          <div key={def.key}>
            {def.type === "checkbox" ? (
              <label className="flex items-center justify-between gap-3 rounded-xl border bg-secondary/20 px-3 py-2.5">
                <span className="text-sm font-medium text-foreground">{def.label}</span>
                <input
                  type="checkbox"
                  checked={settings[def.key] === "true"}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      [def.key]: e.target.checked ? "true" : "false",
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </label>
            ) : def.type === "textarea" ? (
              <>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {def.label}
              </label>
              <textarea
                value={settings[def.key] || ""}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, [def.key]: e.target.value }))
                }
                rows={3}
                className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              </>
            ) : (
              <>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {def.label}
              </label>
              <input
                type={def.type}
                value={settings[def.key] || ""}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, [def.key]: e.target.value }))
                }
                className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
