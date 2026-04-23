"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  ChevronRight,
  Check,
  Loader2,
  Package,
  Megaphone,
  Boxes,
} from "lucide-react";

type NotificationPreferences = {
  order: boolean;
  marketing: boolean;
  stock: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  order: true,
  marketing: true,
  stock: true,
};

export default function NotificationPreferencesPage() {
  const { user, loading: authLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    supabase
      .from("users")
      .select("notification_preferences")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setPrefs({
          ...DEFAULT_PREFERENCES,
          ...(data?.notification_preferences || {}),
        });
        setLoading(false);
      });
  }, [user]);

  function updatePref(key: keyof NotificationPreferences, value: boolean) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("users")
        .update({ notification_preferences: prefs })
        .eq("id", user.id);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/hesabim" className="hover:text-primary transition-colors">Hesabım</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Bildirimler</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bildirim Tercihleri</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hangi bildirimleri almak istediğini buradan yönetebilirsin.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border p-5 md:p-6 space-y-5">
            <h2 className="font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              E-posta Bildirimleri
            </h2>

            <PreferenceRow
              icon={Package}
              title="Sipariş Bildirimleri"
              description="Sipariş onayı, kargo ve iade süreci e-postaları"
              checked={prefs.order}
              onCheckedChange={(v) => updatePref("order", v)}
            />

            <PreferenceRow
              icon={Megaphone}
              title="Kampanya ve Duyurular"
              description="Yeni ürünler, indirimler ve bülten içerikleri"
              checked={prefs.marketing}
              onCheckedChange={(v) => updatePref("marketing", v)}
            />

            <PreferenceRow
              icon={Boxes}
              title="Stok Bildirimleri"
              description="Stoğa girince haber ver bildirimleri"
              checked={prefs.stock}
              onCheckedChange={(v) => updatePref("stock", v)}
            />

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Kaydet
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-green-600" role="status" aria-live="polite">
                  <Check className="h-4 w-4" /> Kaydedildi
                </span>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function PreferenceRow({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
        aria-label={title}
      />
    </div>
  );
}
