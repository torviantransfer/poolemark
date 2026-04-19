"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, Settings } from "lucide-react";

interface Setting {
  id: string;
  key: string;
  value: string;
}

const DEFAULT_SETTINGS = [
  { key: "site_name", label: "Site Adı", type: "text" },
  { key: "site_description", label: "Site Açıklaması", type: "text" },
  { key: "contact_email", label: "İletişim E-postası", type: "email" },
  { key: "contact_phone", label: "İletişim Telefonu", type: "text" },
  { key: "contact_address", label: "Adres", type: "textarea" },
  { key: "whatsapp_number", label: "WhatsApp Numarası", type: "text" },
  { key: "instagram_url", label: "Instagram URL", type: "url" },
  { key: "facebook_url", label: "Facebook URL", type: "url" },
  { key: "twitter_url", label: "Twitter / X URL", type: "url" },
  { key: "free_shipping_threshold", label: "Ücretsiz Kargo Limiti (₺)", type: "number" },
  { key: "shipping_cost", label: "Kargo Ücreti (₺)", type: "number" },
  { key: "meta_title", label: "Ana Sayfa Meta Başlık", type: "text" },
  { key: "meta_description", label: "Ana Sayfa Meta Açıklama", type: "textarea" },
];

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
    const map: Record<string, string> = {};
    data?.forEach((s: Setting) => {
      map[s.key] = s.value;
    });
    setSettings(map);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from("site_settings")
          .upsert({ key, value }, { onConflict: "key" });
      }
      alert("Ayarlar kaydedildi.");
    } catch {
      alert("Kaydetme başarısız oldu.");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
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

      <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-5">
        {DEFAULT_SETTINGS.map((def) => (
          <div key={def.key}>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {def.label}
            </label>
            {def.type === "textarea" ? (
              <textarea
                value={settings[def.key] || ""}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, [def.key]: e.target.value }))
                }
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            ) : (
              <input
                type={def.type}
                value={settings[def.key] || ""}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, [def.key]: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
